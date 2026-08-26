package com.personalsite.service;

import com.personalsite.dto.DailyQuestionTodayDTO;
import com.personalsite.dto.QuestionAnswerDTO;
import com.personalsite.entity.DailyQuestion;
import com.personalsite.entity.QuestionAnswer;
import com.personalsite.exception.BusinessException;
import com.personalsite.repository.DailyQuestionRepository;
import com.personalsite.repository.QuestionAnswerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DailyQuestionService {
    private final DailyQuestionRepository dailyQuestionRepository;
    private final QuestionAnswerRepository questionAnswerRepository;

    /** 今日题目 + 是否已答 + 已有回答。已答时以回答记录的题目为准（题库扩充/重置后不回跳） */
    public DailyQuestionTodayDTO getToday() {
        LocalDate today = LocalDate.now();
        DailyQuestion question = questionAnswerRepository.findByAnsweredOn(today)
                .flatMap(a -> dailyQuestionRepository.findById(a.getQuestionId()))
                .orElseGet(() -> pickQuestionFor(today));

        DailyQuestionTodayDTO dto = new DailyQuestionTodayDTO();
        dto.setQuestionId(question.getId());
        dto.setText(question.getText());
        dto.setDate(today);

        questionAnswerRepository.findByAnsweredOn(today).ifPresent(a -> {
            dto.setAnswered(true);
            dto.setAnswer(a.getAnswerText());
        });
        return dto;
    }

    /** 提交 / 修改今日回答（每天一条，upsert）。题目以今日首次作答时锁定的为准 */
    @Transactional
    public DailyQuestionTodayDTO answerToday(String answerText) {
        if (answerText == null || answerText.isBlank()) {
            throw new BusinessException("回答不能为空");
        }
        LocalDate today = LocalDate.now();

        QuestionAnswer answer = questionAnswerRepository.findByAnsweredOn(today)
                .orElseGet(() -> {
                    QuestionAnswer a = new QuestionAnswer();
                    a.setAnsweredOn(today);
                    a.setQuestionId(pickQuestionFor(today).getId());
                    return a;
                });
        answer.setAnswerText(answerText.trim());
        questionAnswerRepository.save(answer);

        return getToday();
    }

    /** 历史问答时间线（按日期倒序），回显当时的题目文本 */
    public List<QuestionAnswerDTO> getAnswers() {
        Map<Long, String> questionTextById = dailyQuestionRepository.findAll().stream()
                .collect(Collectors.toMap(DailyQuestion::getId, DailyQuestion::getText));

        return questionAnswerRepository.findAllByOrderByAnsweredOnDesc().stream()
                .map(a -> {
                    QuestionAnswerDTO dto = new QuestionAnswerDTO();
                    dto.setDate(a.getAnsweredOn());
                    dto.setQuestionText(questionTextById.getOrDefault(a.getQuestionId(), ""));
                    dto.setAnswerText(a.getAnswerText());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * 选题：优先从未答过的题里按日期确定性抽取（index = epochDay % 未答题数），
     * 全部答过一轮后回到全题库轮换。这样题库扩充后不会短期重复旧题。
     */
    private DailyQuestion pickQuestionFor(LocalDate date) {
        List<DailyQuestion> all = dailyQuestionRepository.findAllByOrderByOrderIndexAsc();
        if (all.isEmpty()) {
            throw new BusinessException("题库为空");
        }
        List<Long> answeredIds = questionAnswerRepository.findAllQuestionIds();
        List<DailyQuestion> pool = all.stream()
                .filter(q -> !answeredIds.contains(q.getId()))
                .collect(Collectors.toList());
        if (pool.isEmpty()) {
            pool = all; // 一轮答完，重置回全题库
        }
        int index = (int) Math.floorMod(date.toEpochDay(), pool.size());
        return pool.get(index);
    }
}
