package com.personalsite.controller;

import com.personalsite.dto.ApiResponse;
import com.personalsite.dto.DailyQuestionTodayDTO;
import com.personalsite.dto.QuestionAnswerDTO;
import com.personalsite.service.DailyQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 每日一问接口。今日题目与历史问答公开可读，提交回答仅 ADMIN。
 */
@RestController
@RequestMapping("/api/daily-question")
@RequiredArgsConstructor
public class DailyQuestionController {
    private final DailyQuestionService dailyQuestionService;

    @GetMapping("/today")
    public ApiResponse<DailyQuestionTodayDTO> today() {
        return ApiResponse.success(dailyQuestionService.getToday());
    }

    @GetMapping("/answers")
    public ApiResponse<List<QuestionAnswerDTO>> answers() {
        return ApiResponse.success(dailyQuestionService.getAnswers());
    }

    @PostMapping("/today/answer")
    public ApiResponse<DailyQuestionTodayDTO> answerToday(@RequestBody QuestionAnswerDTO dto) {
        return ApiResponse.success("已保存今日回答", dailyQuestionService.answerToday(dto.getAnswerText()));
    }
}
