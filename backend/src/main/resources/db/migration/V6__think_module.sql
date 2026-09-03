-- ============================================================
--  V6 「思考一下」模块：每 3 天一期的深度思考题 + AI 评判
--  - think_questions：每期一题（period_index 唯一），由 DeepSeek 生成，
--    类别按 period_index % 3 轮换（产品分析 / 历史事件判断 / 架构设计）
--  - think_answers：每题一份作答文档（question_id 唯一），
--    answer_html 为富文本（可含图片），提交后异步生成 ai_feedback
--  GET 公开只读，写操作仅管理员（SecurityConfig 兜底规则保护）。
-- ============================================================

-- 1. 题目：period_index = (当天日期 - 2026-09-03) / 3，每 3 天一期
CREATE TABLE IF NOT EXISTS think_questions (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    period_index  INT NOT NULL,
    category      VARCHAR(32) NOT NULL,
    question_text TEXT NOT NULL,
    created_at    DATETIME NOT NULL,
    UNIQUE KEY uk_think_questions_period (period_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 作答：每题一份文档；eval_status: NONE/EVALUATING/DONE/FAILED
CREATE TABLE IF NOT EXISTS think_answers (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id  BIGINT NOT NULL,
    answer_html  LONGTEXT,
    ai_feedback  LONGTEXT,
    eval_status  VARCHAR(16) NOT NULL DEFAULT 'NONE',
    created_at   DATETIME NOT NULL,
    updated_at   DATETIME,
    UNIQUE KEY uk_think_answers_question (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
