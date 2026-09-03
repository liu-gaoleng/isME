package com.personalsite.service;

import com.personalsite.dto.ThinkCurrentDTO;
import com.personalsite.dto.ThinkHistoryItemDTO;
import com.personalsite.entity.ThinkAnswer;
import com.personalsite.entity.ThinkQuestion;
import com.personalsite.exception.BusinessException;
import com.personalsite.repository.ThinkAnswerRepository;
import com.personalsite.repository.ThinkQuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 「思考一下」模块：每 3 天一期深度思考题（DeepSeek 生成），作答后 AI 异步评判。
 * 期号规则：period_index = (today - 2026-09-03) / 3；类别按 period_index % 3 轮换。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ThinkService {
    /** 期号锚点：2026-09-03 为第 0 期第一天 */
    private static final LocalDate ANCHOR = LocalDate.of(2026, 9, 3);
    private static final int PERIOD_DAYS = 3;
    private static final String[] CATEGORIES = {"产品分析", "历史事件判断", "架构设计"};

    private final ThinkQuestionRepository questionRepository;
    private final ThinkAnswerRepository answerRepository;
    private final DeepSeekClient deepSeekClient;

    // ---------- 读 ----------

    /** 当前期题目 + 作答 + 评判。缺题时同步生成（可能耗时十几秒） */
    public ThinkCurrentDTO getCurrent() {
        int period = currentPeriodIndex();
        ThinkQuestion question = questionRepository.findByPeriodIndex(period)
                .orElseGet(() -> generateQuestionForPeriod(period));

        ThinkCurrentDTO dto = new ThinkCurrentDTO();
        fillQuestion(dto, question);
        answerRepository.findByQuestionId(question.getId()).ifPresent(a -> {
            dto.setAnswerHtml(a.getAnswerHtml());
            dto.setEvalStatus(a.getEvalStatus());
            dto.setAiFeedback(a.getAiFeedback());
        });
        if (dto.getEvalStatus() == null) {
            dto.setEvalStatus("NONE");
        }
        return dto;
    }

    /** 往期列表（不含当前期），按期号倒序，附作答与评判 */
    public List<ThinkHistoryItemDTO> getHistory() {
        int currentPeriod = currentPeriodIndex();
        Map<Long, ThinkAnswer> answerByQuestionId = answerRepository.findAll().stream()
                .collect(Collectors.toMap(ThinkAnswer::getQuestionId, Function.identity()));

        return questionRepository.findAllByOrderByPeriodIndexDesc().stream()
                .filter(q -> q.getPeriodIndex() < currentPeriod)
                .map(q -> {
                    ThinkHistoryItemDTO dto = new ThinkHistoryItemDTO();
                    fillQuestion(dto, q);
                    ThinkAnswer a = answerByQuestionId.get(q.getId());
                    if (a != null) {
                        dto.setAnswerHtml(a.getAnswerHtml());
                        dto.setEvalStatus(a.getEvalStatus());
                        dto.setAiFeedback(a.getAiFeedback());
                    } else {
                        dto.setEvalStatus("NONE");
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ---------- 写 ----------

    /** 保存草稿（不触发评判） */
    @Transactional
    public ThinkCurrentDTO saveAnswer(String answerHtml) {
        ThinkAnswer answer = upsertAnswer(answerHtml);
        answer.setEvalStatus("NONE");
        answerRepository.save(answer);
        return getCurrent();
    }

    /** 提交作答：保存后异步触发 AI 评判 */
    @Transactional
    public ThinkCurrentDTO submitAnswer(String answerHtml) {
        ThinkAnswer answer = upsertAnswer(answerHtml);
        answer.setEvalStatus("EVALUATING");
        answerRepository.save(answer);
        evaluateAsync(answer.getId());
        return getCurrent();
    }

    /** 换一道：重新生成当前期的题目（已有作答会被保留但不再关联新题——直接清空本期作答更直观，这里选择删除旧作答） */
    @Transactional
    public ThinkCurrentDTO regenerateCurrent() {
        if (!deepSeekClient.isAvailable()) {
            throw new BusinessException("AI 服务未配置（缺少 DEEPSEEK_API_KEY）");
        }
        int period = currentPeriodIndex();
        questionRepository.findByPeriodIndex(period).ifPresent(old -> {
            answerRepository.findByQuestionId(old.getId()).ifPresent(answerRepository::delete);
            questionRepository.delete(old);
        });
        questionRepository.flush();
        generateQuestionForPeriod(period);
        return getCurrent();
    }

    // ---------- AI 评判（异步） ----------

    @Async
    @Transactional
    public void evaluateAsync(Long answerId) {
        ThinkAnswer answer = answerRepository.findById(answerId).orElse(null);
        if (answer == null) {
            return;
        }
        ThinkQuestion question = questionRepository.findById(answer.getQuestionId()).orElse(null);
        if (question == null) {
            return;
        }
        try {
            String plainText = htmlToPlainText(answer.getAnswerHtml());
            String feedback = deepSeekClient.evaluateAnswer(
                    question.getCategory(), question.getQuestionText(), plainText);
            answer.setAiFeedback(feedback);
            answer.setEvalStatus("DONE");
        } catch (Exception e) {
            log.error("AI 评判失败 answerId={}", answerId, e);
            answer.setEvalStatus("FAILED");
        }
        answerRepository.save(answer);
    }

    // ---------- 出题 ----------

    /** 确保当前期已有题目（定时任务调用）。生成失败只记日志，等下一轮重试 */
    public void ensureCurrentPeriodQuestion() {
        int period = currentPeriodIndex();
        if (questionRepository.findByPeriodIndex(period).isPresent()) {
            return;
        }
        try {
            generateQuestionForPeriod(period);
        } catch (Exception e) {
            log.error("定时出题失败 period={}", period, e);
        }
    }

    private ThinkQuestion generateQuestionForPeriod(int periodIndex) {
        if (!deepSeekClient.isAvailable()) {
            throw new BusinessException("AI 服务未配置，暂时无法出题。请稍后再来。");
        }
        String category = CATEGORIES[Math.floorMod(periodIndex, CATEGORIES.length)];
        List<String> recentTitles = questionRepository.findAllByOrderByPeriodIndexDesc().stream()
                .limit(10)
                .map(q -> q.getQuestionText().substring(0, Math.min(60, q.getQuestionText().length())))
                .collect(Collectors.toList());

        String questionText = deepSeekClient.generateQuestion(category, recentTitles);

        ThinkQuestion question = new ThinkQuestion();
        question.setPeriodIndex(periodIndex);
        question.setCategory(category);
        question.setQuestionText(questionText);
        // 并发/重试下撞 period_index 唯一约束时，按已存在处理
        try {
            return questionRepository.saveAndFlush(question);
        } catch (Exception e) {
            return questionRepository.findByPeriodIndex(periodIndex)
                    .orElseThrow(() -> new BusinessException("出题失败，请稍后再试"));
        }
    }

    // ---------- 内部工具 ----------

    private ThinkAnswer upsertAnswer(String answerHtml) {
        if (answerHtml == null || answerHtml.isBlank()) {
            throw new BusinessException("回答不能为空");
        }
        int period = currentPeriodIndex();
        ThinkQuestion question = questionRepository.findByPeriodIndex(period)
                .orElseThrow(() -> new BusinessException("当前期还没有题目"));
        ThinkAnswer answer = answerRepository.findByQuestionId(question.getId())
                .orElseGet(() -> {
                    ThinkAnswer a = new ThinkAnswer();
                    a.setQuestionId(question.getId());
                    return a;
                });
        answer.setAnswerHtml(answerHtml.trim());
        return answerRepository.save(answer);
    }

    private int currentPeriodIndex() {
        return (int) (ChronoUnit.DAYS.between(ANCHOR, LocalDate.now()) / PERIOD_DAYS);
    }

    private void fillQuestion(ThinkCurrentDTO dto, ThinkQuestion q) {
        dto.setQuestionId(q.getId());
        dto.setPeriodIndex(q.getPeriodIndex());
        dto.setCategory(q.getCategory());
        dto.setQuestionText(q.getQuestionText());
        dto.setPeriodStart(ANCHOR.plusDays((long) q.getPeriodIndex() * PERIOD_DAYS));
        dto.setPeriodEnd(ANCHOR.plusDays((long) (q.getPeriodIndex() + 1) * PERIOD_DAYS - 1));
        dto.setAiAvailable(deepSeekClient.isAvailable());
    }

    private void fillQuestion(ThinkHistoryItemDTO dto, ThinkQuestion q) {
        dto.setQuestionId(q.getId());
        dto.setPeriodIndex(q.getPeriodIndex());
        dto.setCategory(q.getCategory());
        dto.setQuestionText(q.getQuestionText());
        dto.setPeriodStart(ANCHOR.plusDays((long) q.getPeriodIndex() * PERIOD_DAYS));
        dto.setPeriodEnd(ANCHOR.plusDays((long) (q.getPeriodIndex() + 1) * PERIOD_DAYS - 1));
    }

    /** 富文本转纯文本（供 AI 阅读）：去标签、压空白 */
    private String htmlToPlainText(String html) {
        if (html == null) {
            return "";
        }
        return html.replaceAll("<br\\s*/?>", "\n")
                .replaceAll("</p>", "\n\n")
                .replaceAll("</li>", "\n")
                .replaceAll("<[^>]+>", "")
                .replaceAll("&nbsp;", " ")
                .replaceAll("&amp;", "&")
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">")
                .replaceAll("&quot;", "\"")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
    }
}
