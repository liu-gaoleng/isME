-- ============================================================
--  V3 「me」个人模块：画板 / 小确幸 / 每日一问
--  三块内容公开只读，写操作仅管理员（由 SecurityConfig 兜底规则保护）。
--  列名与 JPA 实体严格对应（ddl-auto=validate 会在启动时校验）。
-- ============================================================

-- 1. 画板：每条记录是一块命名画板，scene_json 存 Excalidraw 场景快照
CREATE TABLE IF NOT EXISTS boards (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    scene_json  LONGTEXT,
    created_at  DATETIME NOT NULL,
    updated_at  DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 小确幸：每天让自己开心的小事
CREATE TABLE IF NOT EXISTS happy_moments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    content     TEXT NOT NULL,
    happened_on DATE NOT NULL,
    created_at  DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_happy_moments_happened_on ON happy_moments (happened_on);

-- 3. 每日一问题库：按 order_index 每天确定性轮换（今日 = epochDay % 题库总数）
CREATE TABLE IF NOT EXISTS daily_questions (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_text VARCHAR(500) NOT NULL,
    order_index   INT NOT NULL,
    UNIQUE KEY uk_daily_questions_order_index (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. 每日一问回答：每天一条（answered_on 唯一）
CREATE TABLE IF NOT EXISTS question_answers (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id  BIGINT NOT NULL,
    answered_on  DATE NOT NULL,
    answer_text  TEXT NOT NULL,
    created_at   DATETIME NOT NULL,
    updated_at   DATETIME,
    UNIQUE KEY uk_question_answers_answered_on (answered_on)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
--  预置「每日一问」题库：反思自我 + 引人思考，兼而有之
-- ------------------------------------------------------------
INSERT INTO daily_questions (order_index, question_text) VALUES
    (0,  '如果今天是这一年的缩影，它想提醒你什么？'),
    (1,  '最近一次真正让你感到「活着」的瞬间是什么？'),
    (2,  '你现在坚持的哪件事，五年后的你会感谢今天的自己？'),
    (3,  '如果没有任何人会评价你，你会立刻改变什么？'),
    (4,  '你最害怕失去的，是一样东西，还是一种感觉？'),
    (5,  '上一次改变主意是因为什么？那说明你在乎什么？'),
    (6,  '你把「忙」当成了逃避什么的借口吗？'),
    (7,  '如果只能留下今天做过的一件事，你会留下哪件？'),
    (8,  '你对别人最常见的误解，源自你自己的哪段经历？'),
    (9,  '什么样的成功，是你嘴上想要、心里却并不想要的？'),
    (10, '你上一次为自己骄傲，是因为结果，还是因为过程？'),
    (11, '如果痛苦一定有意义，你最近的那份痛苦在教你什么？'),
    (12, '你愿意用现在的安稳，去换一个不确定的可能吗？为什么？'),
    (13, '你心里那个「等以后再说」的事，究竟在等什么？'),
    (14, '你最想被人记住的，是你的成就，还是你的为人？'),
    (15, '哪一种情绪你总是急着赶走，却从没真正听它说完？'),
    (16, '如果今晚就要离开这座城市，你会最舍不得什么？'),
    (17, '你是在过自己的人生，还是在完成别人的期待？'),
    (18, '你对「足够好」的定义，是你自己的，还是借来的？'),
    (19, '如果重来一次，你还会选现在这条路吗？变的是什么？'),
    (20, '你最近一次落泪，是因为脆弱，还是因为终于放下？'),
    (21, '你身上有哪个优点，是从你讨厌的经历里长出来的？'),
    (22, '如果时间和金钱都不是问题，明天你会去做什么？'),
    (23, '你愿意原谅过去的自己吗？从哪件事开始？'),
    (24, '你以为的「性格」，有多少其实只是习惯？'),
    (25, '什么话你一直想对某个人说，却始终没说出口？'),
    (26, '你更怕做错，还是更怕什么都没做？'),
    (27, '如果幸福是一种能力，你觉得自己练到第几级了？'),
    (28, '你现在拥有的东西里，哪一样是你曾经拼命想要的？'),
    (29, '当没有人看着你时，你是一个怎样的人？'),
    (30, '你把最好的耐心留给了谁？把最差的脾气又留给了谁？'),
    (31, '你人生中「浪费」掉的时光，真的浪费了吗？'),
    (32, '如果明天醒来问题都解决了，你的生活会有什么不同？'),
    (33, '你在用谁的标准，衡量自己这一生？'),
    (34, '你最近一次说「没关系」，其实是想说什么？'),
    (35, '你愿意成为孩子眼中的那种大人吗？还差多远？'),
    (36, '什么事你一直说不擅长，其实只是没敢开始？'),
    (37, '你和十年前的自己相比，丢掉了什么，又捡回了什么？'),
    (38, '你追求的自由，是「不被约束」，还是「有能力选择」？'),
    (39, '如果只剩一年，你会先删掉生活里的哪三件事？');
