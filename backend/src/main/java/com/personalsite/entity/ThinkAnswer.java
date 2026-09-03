package com.personalsite.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 「思考一下」作答文档：每题一份（question_id 唯一）。
 * answer_html 为富文本（可含图片）；提交后异步评判，结果写入 ai_feedback。
 * eval_status: NONE（草稿/未评判）EVALUATING（评判中）DONE（已完成）FAILED（评判失败）
 */
@Data
@Entity
@Table(name = "think_answers")
public class ThinkAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_id", nullable = false, unique = true)
    private Long questionId;

    @Column(name = "answer_html", columnDefinition = "LONGTEXT")
    private String answerHtml;

    @Column(name = "ai_feedback", columnDefinition = "LONGTEXT")
    private String aiFeedback;

    @Column(name = "eval_status", nullable = false, length = 16)
    private String evalStatus = "NONE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
