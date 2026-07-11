package com.personalsite.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class HappyMomentDTO {
    private Long id;

    @NotBlank(message = "内容不能为空")
    private String content;

    // 可选：不传则由后端按当天填充
    private LocalDate happenedOn;

    private LocalDateTime createdAt;
}
