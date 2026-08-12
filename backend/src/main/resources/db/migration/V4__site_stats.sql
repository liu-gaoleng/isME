-- ============================================================
--  V4 站点访问统计：访客数（UV）与访问次数（PV）
--  - PV：每次页面加载 +1（site_stats 单行计数器）
--  - UV：前端为每个浏览器生成持久 visitor_id，按 id 去重，累计只增不减
--  上报接口 POST /api/stats/visit 公开匿名（SecurityConfig 放行 + 免 CSRF）。
-- ============================================================

-- 1. 计数器：单行表，total_visits 记录全站累计访问次数
CREATE TABLE IF NOT EXISTS site_stats (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    total_visits BIGINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO site_stats (id, total_visits)
SELECT 1, 0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM site_stats WHERE id = 1);

-- 2. 独立访客：visitor_id 由前端生成（localStorage 持久化），唯一约束即去重逻辑
CREATE TABLE IF NOT EXISTS site_visitors (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    visitor_id     VARCHAR(64) NOT NULL,
    first_visit_at DATETIME NOT NULL,
    last_visit_at  DATETIME NOT NULL,
    UNIQUE KEY uk_site_visitors_visitor_id (visitor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
