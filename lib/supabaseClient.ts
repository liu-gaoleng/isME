import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * 浏览器端共享的 Supabase 客户端。
 * 使用 NEXT_PUBLIC_* 环境变量；这两个值是公开 anon key，安全性由数据库 RLS 策略保证。
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) {
    if (typeof window !== 'undefined') {
      // 仅在缺少配置时静默返回 null，UI 层会做降级提示
      return null;
    }
    return null;
  }
  if (!_client) {
    _client = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
  }
  return _client;
}

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}
