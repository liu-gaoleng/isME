package com.personalsite.controller;

import com.personalsite.dto.ApiResponse;
import com.personalsite.dto.VisitStatsDTO;
import com.personalsite.service.SiteStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * 站点访问统计接口。GET 公开只读；POST /visit 为访客行为上报，公开匿名。
 */
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class SiteStatsController {
    private final SiteStatsService siteStatsService;

    @GetMapping
    public ApiResponse<VisitStatsDTO> stats() {
        return ApiResponse.success(siteStatsService.currentStats());
    }

    @PostMapping("/visit")
    public ApiResponse<VisitStatsDTO> recordVisit(@RequestBody Map<String, String> body) {
        return ApiResponse.success(siteStatsService.recordVisit(body.get("visitorId")));
    }
}
