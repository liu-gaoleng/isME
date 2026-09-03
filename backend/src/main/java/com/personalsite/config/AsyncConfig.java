package com.personalsite.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 开启异步与定时调度（「思考一下」模块的异步 AI 评判 + 定时出题）。
 */
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {
}
