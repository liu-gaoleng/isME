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

    /** 今日题目（按日期确定性轮换）+ 是否已答 + 已有回答 */
    public DailyQuestionTodayDTO getToday() {
        LocalDate today = LocalDate.now();
        DailyQuestion question = pickQuestionFor(today);

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

    /** 提交 / 修改今日回答（每天一条，upsert） */
    @Transactional
    public DailyQuestionTodayDTO answerToday(String answerText) {
        if (answerText == null || answerText.isBlank()) {
            throw new BusinessException("回答不能为空");
        }
        LocalDate today = LocalDate.now();
        DailyQuestion question = pickQuestionFor(today);

        QuestionAnswer answer = questionAnswerRepository.findByAnsweredOn(today)
                .orElseGet(QuestionAnswer::new);
        answer.setAnsweredOn(today);
        answer.setQuestionId(question.getId());
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

    /** 按日期从题库确定性地取一题：index = epochDay % 题库总数 */
    private DailyQuestion pickQuestionFor(LocalDate date) {
        long count = dailyQuestionRepository.count();
        if (count == 0) {
            throw new BusinessException("题库为空");
        }
        int index = (int) Math.floorMod(date.toEpochDay(), count);
        return dailyQuestionRepository.findByOrderIndex(index)
                .orElseThrow(() -> new BusinessException("题目不存在"));
    }
}
