-- =========================================================
--  Liu's Notes — 评论系统 Schema (Supabase / PostgreSQL)
--  在 Supabase 项目 SQL Editor 里整段执行即可。
--  执行完后请到 Project Settings → API 复制 URL 与 anon key
--  填入项目根目录 .env.local：
--    NEXT_PUBLIC_SUPABASE_URL=...
--    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
-- =========================================================

-- 1. 评论表
create table if not exists public.comments (
  id              uuid primary key default gen_random_uuid(),
  -- 文章 ID，对应 lib/notes.ts 里的 note.id
  note_id         text not null,
  -- 父评论：null 表示顶层评论；否则指向某条已有评论的 id（一层回复线程）
  parent_id       uuid references public.comments(id) on delete cascade,
  -- 被引用的原文片段；顶层评论会带，回复评论可为空
  quote_text      text,
  -- 评论正文
  body            text not null check (char_length(body) between 1 and 4000),
  -- 访客昵称（必填，用户自填）
  author_name     text not null check (char_length(author_name) between 1 and 40),
  -- 创建时间
  created_at      timestamptz not null default now()
);

-- 2. 索引：按文章查询 + 时间排序
create index if not exists comments_note_id_created_at_idx
  on public.comments (note_id, created_at);

create index if not exists comments_parent_id_idx
  on public.comments (parent_id);

-- 3. 行级安全策略 (RLS)
alter table public.comments enable row level security;

-- 任何人（含匿名访客）可读
drop policy if exists "comments are readable by anyone" on public.comments;
create policy "comments are readable by anyone"
  on public.comments
  for select
  using (true);

-- 任何人可插入；插入内容由表上 check 约束限制长度
drop policy if exists "anyone can insert a comment" on public.comments;
create policy "anyone can insert a comment"
  on public.comments
  for insert
  with check (
    char_length(body) between 1 and 4000
    and char_length(author_name) between 1 and 40
  );

-- 默认禁止 update / delete（不创建对应 policy 即可）。
-- 如未来需要管理员删除/隐藏，建议通过 Supabase service-role key 在后台执行，
-- 不要让 anon key 拥有 delete 权限。

-- 4. （可选）实时通知：让前端订阅评论变化
-- Supabase 默认会为带有 RLS 的表启用 realtime；如未启用可执行：
-- alter publication supabase_realtime add table public.comments;
