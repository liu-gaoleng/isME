package com.personalsite.dto;

import lombok.Data;
import java.time.LocalDate;

/**
 * 「每日一问」今日视图：今天轮到的题目 + 是否已答 + 已有的回答。
 */
@Data
public class DailyQuestionTodayDTO {
    private Long questionId;
    private String text;
    private LocalDate date;
    private boolean answered;
    private String answer;
}
