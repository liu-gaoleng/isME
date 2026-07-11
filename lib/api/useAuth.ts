'use client';

import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from './config';

/**
 * 判断当前访问者是否为已登录的管理员（即站长本人）。
 * 用于「公开展示 + 仅本人可编辑」：编辑按钮只在返回 true 时渲染。
 *
 * 注意：不能用 lib/api 的 getMe()，因为其底层 client 在 401 时会自动跳转 /login，
 * 会把未登录访客从公开页面踢走。这里用裸 fetch 静默探测，401 时仅返回 false。
 */
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API_ENDPOINTS.me, { credentials: 'include' });
        if (!res.ok) {
          if (!cancelled) setIsAdmin(false);
          return;
        }
        const body = await res.json();
        if (!cancelled) setIsAdmin(body?.data?.role === 'ADMIN');
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { isAdmin, checking };
}
