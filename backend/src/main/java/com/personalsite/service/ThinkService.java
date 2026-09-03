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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 「思考一下」模块：每 3 天一期深度思考题（DeepSeek 生成），作答后 AI 异步评判。
 * 期号规则：period_index = (today - 2026-09-03) / 3；类别按 period_index % 3 轮换。
 * 作答按 questionId 路由——当期可答，往期未答的题也允许补答。
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
    private final ThinkEvaluationService evaluationService;

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
                .map(q -> toHistoryItem(q, answerByQuestionId.get(q.getId())))
                .collect(Collectors.toList());
    }

    /** 单题视图：题目 + 作答 + 评判（补答提交后前端轮询用） */
    public ThinkHistoryItemDTO getQuestion(Long questionId) {
        ThinkQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException("题目不存在"));
        return toHistoryItem(question,
                answerRepository.findByQuestionId(questionId).orElse(null));
    }

    // ---------- 写（按 questionId 路由，支持补答往期） ----------

    /** 保存草稿（不触发评判） */
    @Transactional
    public ThinkHistoryItemDTO saveAnswer(Long questionId, String answerHtml) {
        ThinkAnswer answer = upsertAnswer(questionId, answerHtml);
        answer.setEvalStatus("NONE");
        answerRepository.save(answer);
        return getQuestion(questionId);
    }

    /** 提交作答：保存后注册事务提交回调，落库完成再异步触发 AI 评判 */
    @Transactional
    public ThinkHistoryItemDTO submitAnswer(Long questionId, String answerHtml) {
        ThinkAnswer answer = upsertAnswer(questionId, answerHtml);
        answer.setEvalStatus("EVALUATING");
        answerRepository.save(answer);

        Long answerId = answer.getId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                evaluationService.evaluate(answerId);
            }
        });
        return getQuestion(questionId);
    }

    /** 换一道：重新生成当前期的题目（清空本期已有作答） */
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

    private static final int MAX_GENERATE_ATTEMPTS = 3;

    private ThinkQuestion generateQuestionForPeriod(int periodIndex) {
        if (!deepSeekClient.isAvailable()) {
            throw new BusinessException("AI 服务未配置，暂时无法出题。请稍后再来。");
        }
        String category = CATEGORIES[Math.floorMod(periodIndex, CATEGORIES.length)];
        List<String> recentTitles = questionRepository.findAllByOrderByPeriodIndexDesc().stream()
                .limit(10)
                .map(q -> q.getQuestionText().substring(0, Math.min(60, q.getQuestionText().length())))
                .collect(Collectors.toList());

        // 生成 + 质检双 AI 流程：不合格打回重出（最多 3 次），
        // 不合格版本加入避开列表防止换汤不换药；仍不合格则保留并标记 FAILED。
        String questionText = null;
        String reviewStatus = "SKIPPED";
        String reviewNote = null;
        for (int attempt = 1; attempt <= MAX_GENERATE_ATTEMPTS; attempt++) {
            questionText = deepSeekClient.generateQuestion(category, recentTitles);
            try {
                DeepSeekClient.ReviewResult review = deepSeekClient.reviewQuestion(category, questionText);
                if (review.passed()) {
                    reviewStatus = "PASSED";
                    reviewNote = review.note();
                    break;
                }
                reviewStatus = "FAILED";
                reviewNote = review.note();
                log.warn("题目质检未通过 period={} attempt={}: {}", periodIndex, attempt, review.note());
                recentTitles.add(questionText.substring(0, Math.min(60, questionText.length())));
            } catch (Exception e) {
                // 质检调用本身失败：不阻塞出题，标记为未审查
                log.error("题目质检调用失败，直接采用本期题目 period={}", periodIndex, e);
                reviewStatus = "SKIPPED";
                break;
            }
        }

        ThinkQuestion question = new ThinkQuestion();
        question.setPeriodIndex(periodIndex);
        question.setCategory(category);
        question.setQuestionText(questionText);
        question.setReviewStatus(reviewStatus);
        question.setReviewNote(reviewNote);
        // 并发/重试下撞 period_index 唯一约束时，按已存在处理
        try {
            return questionRepository.saveAndFlush(question);
        } catch (Exception e) {
            return questionRepository.findByPeriodIndex(periodIndex)
                    .orElseThrow(() -> new BusinessException("出题失败，请稍后再试"));
        }
    }

    // ---------- 内部工具 ----------

    private ThinkAnswer upsertAnswer(Long questionId, String answerHtml) {
        if (answerHtml == null || answerHtml.isBlank()) {
            throw new BusinessException("回答不能为空");
        }
        ThinkQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException("题目不存在"));
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

    private ThinkHistoryItemDTO toHistoryItem(ThinkQuestion q, ThinkAnswer a) {
        ThinkHistoryItemDTO dto = new ThinkHistoryItemDTO();
        dto.setQuestionId(q.getId());
        dto.setPeriodIndex(q.getPeriodIndex());
        dto.setCategory(q.getCategory());
        dto.setQuestionText(q.getQuestionText());
        dto.setReviewStatus(q.getReviewStatus());
        dto.setReviewNote(q.getReviewNote());
        dto.setPeriodStart(ANCHOR.plusDays((long) q.getPeriodIndex() * PERIOD_DAYS));
        dto.setPeriodEnd(ANCHOR.plusDays((long) (q.getPeriodIndex() + 1) * PERIOD_DAYS - 1));
        if (a != null) {
            dto.setAnswerHtml(a.getAnswerHtml());
            dto.setEvalStatus(a.getEvalStatus());
            dto.setAiFeedback(a.getAiFeedback());
        } else {
            dto.setEvalStatus("NONE");
        }
        return dto;
    }

    private void fillQuestion(ThinkCurrentDTO dto, ThinkQuestion q) {
        dto.setQuestionId(q.getId());
        dto.setPeriodIndex(q.getPeriodIndex());
        dto.setCategory(q.getCategory());
        dto.setQuestionText(q.getQuestionText());
        dto.setReviewStatus(q.getReviewStatus());
        dto.setReviewNote(q.getReviewNote());
        dto.setPeriodStart(ANCHOR.plusDays((long) q.getPeriodIndex() * PERIOD_DAYS));
        dto.setPeriodEnd(ANCHOR.plusDays((long) (q.getPeriodIndex() + 1) * PERIOD_DAYS - 1));
        dto.setAiAvailable(deepSeekClient.isAvailable());
    }
}
