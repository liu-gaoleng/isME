package com.personalsite.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 「思考一下」定时出题：每 6 小时检查当前期是否已有题，缺题则调 DeepSeek 生成。
 * 正常访问时也会懒生成，这里是兜底，保证新期开始后题目尽快就位。
 */
@Component
@RequiredArgsConstructor
public class ThinkScheduler {
    private final ThinkService thinkService;

    @Scheduled(cron = "0 0 */6 * * ?")
    public void ensureCurrentPeriodQuestion() {
        thinkService.ensureCurrentPeriodQuestion();
    }
}
