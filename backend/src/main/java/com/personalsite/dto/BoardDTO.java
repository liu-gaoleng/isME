package com.personalsite.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BoardDTO {
    private Long id;
    private String title;
    // 列表接口不返回场景（体积大），仅详情接口带上
    private String sceneJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
