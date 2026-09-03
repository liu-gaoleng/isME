-- ============================================================
--  V7 「思考一下」出题质检：给 think_questions 记录质检结果
--  出题流程改为「生成 + 审查」双 AI 调用：审查不通过打回重出（最多 3 次），
--  review_status 记录最终质检状态：PASSED / FAILED（3次均未过，保留但标记）/
--  SKIPPED（质检调用本身失败，未审查直接采用）。
-- ============================================================

ALTER TABLE think_questions
    ADD COLUMN review_status VARCHAR(16) NOT NULL DEFAULT 'PASSED',
    ADD COLUMN review_note   VARCHAR(500) NULL;
