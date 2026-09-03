package com.personalsite.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 「思考一下」题目：每 3 天一期（period_index 唯一），由 DeepSeek 生成。
 * category: 产品分析 / 历史事件判断 / 架构设计，按 period_index % 3 轮换。
 */
@Data
@Entity
@Table(name = "think_questions")
public class ThinkQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "period_index", nullable = false, unique = true)
    private Integer periodIndex;

    @Column(name = "category", nullable = false, length = 32)
    private String category;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
