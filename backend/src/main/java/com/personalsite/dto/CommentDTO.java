package com.personalsite.dto;

import lombok.Data;

@Data
public class CommentDTO {
    private Long id;
    private String content;
    private String authorName;
    private String authorEmail;
    private Long articleId;
    private String articleTitle;
    private Boolean isApproved;
    private java.time.LocalDateTime createdAt;
}
