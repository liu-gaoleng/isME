package com.personalsite.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class ArticleDTO {
    private Long id;
    
    @NotBlank(message = "标题不能为空")
    @Size(max = 200, message = "标题长度不能超过200个字符")
    private String title;
    
    @NotBlank(message = "Slug不能为空")
    private String slug;
    
    @NotBlank(message = "内容不能为空")
    private String content;
    
    private String summary;
    private String coverImage;
    private Integer viewCount;
    private Boolean isPublished;
    private Boolean isFeatured;
    private Long categoryId;
    private String categoryName;
    private Long authorId;
    private String authorName;
    private Set<String> tagNames;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
