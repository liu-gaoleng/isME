package com.personalsite.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * 每日一问题库中的一题。order_index 用于按日期确定性轮换。
 */
@Data
@Entity
@Table(name = "daily_questions")
public class DailyQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_text", nullable = false, length = 500)
    private String text;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;
}
