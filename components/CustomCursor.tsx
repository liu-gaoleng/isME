'use client';

import { useEffect, useRef } from 'react';

/**
 * 自定义光标：
 * - 默认：绿色实心小圆
 * - hover 到可交互元素时，圆本身以 1.6 ~ 2.6 之间的随机倍率放大，始终实心
 * - 移动时带 4 节渐弱的拖尾小圆，营造丝滑的运动残影
 * - 触控屏 / 启用减弱动效时自动禁用
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 拖尾段配置：跟随系数越小越慢，size 越小、opacity 越淡 → 形成渐弱拖尾
  const trail = [
    { lerp: 0.32, size: 9, opacity: 0.55 },
    { lerp: 0.22, size: 8, opacity: 0.4 },
    { lerp: 0.16, size: 7, opacity: 0.28 },
    { lerp: 0.1, size: 6, opacity: 0.18 },
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || reduceMotion) {
      document.documentElement.classList.remove('cursor-active');
      return;
    }
    document.documentElement.classList.add('cursor-active');

    const dot = dotRef.current;
    const container = containerRef.current;
    const trails = trailRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!dot || !container) return;

    container.style.opacity = '0';

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    const trailPos = trail.map(() => ({ x: mouseX, y: mouseY }));
    let hasMoved = false;
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!hasMoved) {
        dotX = mouseX;
        dotY = mouseY;
        trailPos.forEach((p) => {
          p.x = mouseX;
          p.y = mouseY;
        });
        container.style.opacity = '1';
        hasMoved = true;
      }
    };

    const animate = () => {
      // 主圆点几乎实时跟随
      dotX += (mouseX - dotX) * 0.55;
      dotY += (mouseY - dotY) * 0.55;
      dot.style.left = `${dotX}px`;
      dot.style.top = `${dotY}px`;

      // 拖尾按各自 lerp 系数追主圆点
      trails.forEach((el, i) => {
        const cfg = trail[i];
        const target = i === 0 ? { x: dotX, y: dotY } : trailPos[i - 1];
        trailPos[i].x += (target.x - trailPos[i].x) * cfg.lerp;
        trailPos[i].y += (target.y - trailPos[i].y) * cfg.lerp;
        el.style.left = `${trailPos[i].x}px`;
        el.style.top = `${trailPos[i].y}px`;
      });

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    window.addEventListener('mousemove', onMove);

    const interactiveSelector =
      'a, button, [role="button"], input, textarea, select, label, summary, .control-pill, [data-cursor="hover"]';

    const setHover = (hovering: boolean) => {
      if (hovering) {
        const scale = 1.6 + Math.random() * 1.0; // 1.6 ~ 2.6
        dot.style.setProperty('--cursor-scale', scale.toFixed(2));
        dot.classList.add('is-hovering');
      } else {
        dot.style.setProperty('--cursor-scale', '1');
        dot.classList.remove('is-hovering');
      }
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest?.(interactiveSelector)) setHover(true);
    };
    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const related = (e as MouseEvent & { relatedTarget: EventTarget | null })
        .relatedTarget as HTMLElement | null;
      if (target && target.closest?.(interactiveSelector)) {
        if (!related || !related.closest?.(interactiveSelector)) setHover(false);
      }
    };

    const onDown = () => dot.classList.add('is-down');
    const onUp = () => dot.classList.remove('is-down');
    const onLeave = () => {
      container.style.opacity = '0';
    };
    const onEnter = () => {
      if (hasMoved) container.style.opacity = '1';
    };

    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
      document.documentElement.classList.remove('cursor-active');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0,
        transition: 'opacity 0.25s ease',
      }}
    >
      {/* 拖尾段（位于主圆点下方） */}
      {trail.map((cfg, i) => (
        <div
          key={i}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          className="custom-cursor custom-cursor__trail"
          style={{
            width: `${cfg.size}px`,
            height: `${cfg.size}px`,
            opacity: cfg.opacity,
          }}
        />
      ))}
      {/* 主实心圆点 */}
      <div ref={dotRef} className="custom-cursor custom-cursor__dot" />
    </div>
  );
}
