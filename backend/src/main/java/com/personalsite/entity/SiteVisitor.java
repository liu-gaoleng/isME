package com.personalsite.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 独立访客：visitorId 由前端为每个浏览器生成并持久化，
 * visitor_id 唯一约束即 UV 去重逻辑——同一浏览器永远只占一行。
 */
@Data
@Entity
@Table(name = "site_visitors")
public class SiteVisitor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "visitor_id", nullable = false, length = 64, unique = true)
    private String visitorId;

    @Column(name = "first_visit_at", nullable = false, updatable = false)
    private LocalDateTime firstVisitAt;

    @Column(name = "last_visit_at", nullable = false)
    private LocalDateTime lastVisitAt;
}
