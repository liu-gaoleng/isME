package com.personalsite.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 「思考一下」保存/提交作答的请求体。
 */
@Data
public class ThinkAnswerRequest {
    @NotBlank(message = "回答不能为空")
    private String answerHtml;
}
