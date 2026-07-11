package com.personalsite.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

/**
 * 历史问答条目（时间线）/ 提交回答的入参。
 */
@Data
public class QuestionAnswerDTO {
    private LocalDate date;
    private String questionText;

    @NotBlank(message = "回答不能为空")
    private String answerText;
}
