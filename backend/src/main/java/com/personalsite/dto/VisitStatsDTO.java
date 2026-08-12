package com.personalsite.dto;

import lombok.Data;

/**
 * 站点访问统计：totalVisits 为累计访问次数（PV），totalVisitors 为累计独立访客数（UV）。
 */
@Data
public class VisitStatsDTO {
    private Long totalVisits;
    private Long totalVisitors;
}
