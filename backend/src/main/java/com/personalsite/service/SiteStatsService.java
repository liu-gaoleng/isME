package com.personalsite.service;

import com.personalsite.dto.VisitStatsDTO;
import com.personalsite.entity.SiteVisitor;
import com.personalsite.exception.BusinessException;
import com.personalsite.repository.SiteStatRepository;
import com.personalsite.repository.SiteVisitorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

/**
 * 站点访问统计。PV 与 UV 是两套独立逻辑：
 * - PV：每次上报都对单行计数器原子 +1，不做任何去重
 * - UV：按前端生成的 visitorId 去重，已存在的访客只刷新 lastVisitAt，不计为新访客
 */
@Service
@RequiredArgsConstructor
public class SiteStatsService {
    private final SiteStatRepository siteStatRepository;
    private final SiteVisitorRepository siteVisitorRepository;

    @Transactional
    public VisitStatsDTO recordVisit(String visitorId) {
        if (visitorId == null || visitorId.isBlank() || visitorId.length() > 64) {
            throw new BusinessException("无效的访客标识");
        }

        // PV：原子自增；计数器行由 V4 迁移预置，理论上必然存在
        if (siteStatRepository.incrementVisits() == 0) {
            throw new BusinessException("访问计数器未初始化");
        }

        // UV：新访客落一行；并发下撞唯一约束则按已存在处理（不重复计数）
        String id = visitorId.trim();
        siteVisitorRepository.findByVisitorId(id).ifPresentOrElse(
                visitor -> visitor.setLastVisitAt(LocalDateTime.now()),
                () -> {
                    try {
                        SiteVisitor visitor = new SiteVisitor();
                        visitor.setVisitorId(id);
                        visitor.setFirstVisitAt(LocalDateTime.now());
                        visitor.setLastVisitAt(LocalDateTime.now());
                        siteVisitorRepository.saveAndFlush(visitor);
                    } catch (DataIntegrityViolationException ignored) {
                        // 并发插入同一 visitorId：唯一约束兜底，忽略即可
                    }
                });

        return currentStats();
    }

    @Transactional(readOnly = true)
    public VisitStatsDTO currentStats() {
        VisitStatsDTO dto = new VisitStatsDTO();
        dto.setTotalVisits(siteStatRepository.findById(1L).map(s -> s.getTotalVisits()).orElse(0L));
        dto.setTotalVisitors(siteVisitorRepository.count());
        return dto;
    }
}
