-- ============================================================
--  V2 初始参考数据：默认分类与标签
--  ⚠️ 刻意不在迁移脚本里创建管理员账户 / 写入任何密码（避免把口令提交进仓库）。
--
--  创建管理员的推荐做法（部署后执行一次）：
--    1. 用后端生成 BCrypt 密码哈希（在 backend 目录）：
--         mvn -q -Dexec.mainClass=... 或写个一次性工具；
--       或用任意 BCrypt 工具对你的强密码加密。
--    2. 连上数据库执行（把 <BCRYPT_HASH> 换成上一步结果）：
--         INSERT INTO users (username, email, password, nickname, bio, role, enabled, created_at, updated_at)
--         VALUES ('admin', 'you@example.com', '<BCRYPT_HASH>', '博主', '个人网站', 'ADMIN', TRUE, NOW(), NOW());
-- ============================================================

-- 默认分类
INSERT INTO categories (name, slug, description, created_at, updated_at) VALUES
    ('技术', 'tech',  '技术相关文章', NOW(), NOW()),
    ('生活', 'life',  '生活随笔',     NOW(), NOW()),
    ('随笔', 'essay', '杂文随想',     NOW(), NOW());

-- 默认标签
INSERT INTO tags (name, slug, created_at) VALUES
    ('Java',        'java',        NOW()),
    ('Spring Boot', 'spring-boot', NOW()),
    ('React',       'react',       NOW()),
    ('Next.js',     'nextjs',      NOW()),
    ('MySQL',       'mysql',       NOW());
