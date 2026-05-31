'use client';

import { useEffect } from 'react';

/**
 * 在页面挂载后启用基于 IntersectionObserver 的滚动揭示动画。
 * 给元素加上 className="reveal" 即可在进入视口时触发淡入上移。
 *
 * @param deps 依赖数组：当依赖变化时重新扫描 DOM 中的 `.reveal`
 *             适用于切换 Tab、切换数据源等会重渲染列表的场景。
 */
export function useScrollReveal(deps: ReadonlyArray<unknown> = []) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));

    if (elements.length === 0) return;

    // 优雅降级：如果不支持 IntersectionObserver，直接显示
    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    elements.forEach((el) => {
      // 如果元素已经被标记可见（之前 Tab 已揭示过），跳过；
      // 否则注册到 observer，等待进入视口
      if (!el.classList.contains('is-visible')) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

