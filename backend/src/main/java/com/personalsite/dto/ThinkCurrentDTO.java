package com.personalsite.dto;

import lombok.Data;
import java.time.LocalDate;

/**
 * 「思考一下」当前期视图：本期题目 + 我的作答 + AI 评判状态与结果。
 */
@Data
public class ThinkCurrentDTO {
    private Long questionId;
    private Integer periodIndex;
    private String category;
    private String questionText;
    /** 出题质检状态：PASSED / FAILED / SKIPPED */
    private String reviewStatus;
    /** 质检一句话结论 */
    private String reviewNote;
    /** 本期起止日期（每期 3 天） */
    private LocalDate periodStart;
    private LocalDate periodEnd;
    /** AI 是否已配置（未配置时前端提示，不出题不评判） */
    private boolean aiAvailable;

    private String answerHtml;
    /** NONE / EVALUATING / DONE / FAILED */
    private String evalStatus;
    private String aiFeedback;
}
