/**
 * 评论数据访问层。
 * 所有读写都走 Supabase RLS 受控的 anon key —— 库内策略只允许 select/insert。
 */
import { getSupabase, isSupabaseConfigured } from './supabaseClient';

export interface NoteComment {
  id: string;
  note_id: string;
  parent_id: string | null;
  quote_text: string | null;
  body: string;
  author_name: string;
  created_at: string;
}

export interface NewCommentInput {
  note_id: string;
  parent_id?: string | null;
  quote_text?: string | null;
  body: string;
  author_name: string;
}

const TABLE = 'comments';

/** 拉取一篇笔记的所有评论（含回复），按时间升序 */
export async function fetchComments(noteId: string): Promise<NoteComment[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from(TABLE)
    .select('*')
    .eq('note_id', noteId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[comments] fetch error', error);
    return [];
  }
  return (data ?? []) as NoteComment[];
}

/** 创建一条评论 / 回复 */
export async function createComment(input: NewCommentInput): Promise<NoteComment> {
  const sb = getSupabase();
  if (!sb) {
    throw new Error('评论服务未配置，请检查 NEXT_PUBLIC_SUPABASE_* 环境变量');
  }
  const payload = {
    note_id: input.note_id,
    parent_id: input.parent_id ?? null,
    quote_text: input.quote_text ?? null,
    body: input.body.trim(),
    author_name: input.author_name.trim(),
  };
  const { data, error } = await sb
    .from(TABLE)
    .insert(payload)
    .select('*')
    .single();
  if (error || !data) {
    console.error('[comments] create error', error);
    throw new Error(error?.message ?? '评论提交失败');
  }
  return data as NoteComment;
}

export { isSupabaseConfigured };
