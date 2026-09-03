package com.personalsite.dto;

import lombok.Data;
import java.time.LocalDate;

/**
 * 「思考一下」往期条目：题目 + 作答 + 评判（前端折叠展开）。
 */
@Data
public class ThinkHistoryItemDTO {
    private Long questionId;
    private Integer periodIndex;
    private String category;
    private String questionText;
    private LocalDate periodStart;
    private LocalDate periodEnd;

    private String answerHtml;
    private String evalStatus;
    private String aiFeedback;
}
