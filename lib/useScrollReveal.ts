'use client';

import { useEffect } from 'react';

/**
 * 在页面挂载后启用基于 IntersectionObserver 的滚动揭示动画。
 * 给元素加上 className="reveal" 即可在进入视口时触发淡入上移。
 */
export function useScrollReveal() {
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

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
