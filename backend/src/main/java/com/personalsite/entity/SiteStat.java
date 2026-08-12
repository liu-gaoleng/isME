package com.personalsite.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * 站点访问计数器：单行表（id=1），totalVisits 记录全站累计访问次数（PV）。
 * 更新走 SiteStatRepository.incrementVisits() 的原子 UPDATE，避免并发丢失。
 */
@Data
@Entity
@Table(name = "site_stats")
public class SiteStat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "total_visits", nullable = false)
    private Long totalVisits = 0L;
}
