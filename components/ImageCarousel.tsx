'use client';

import { useEffect, useRef, useState } from 'react';

interface ImageCarouselProps {
  images: { src: string; alt?: string; caption?: string }[];
  /** 图片框的高度类（Tailwind） */
  heightClass?: string;
}

/**
 * 丝滑的图片轮播：
 * - 切换形式：交叉淡入淡出 + 轻微视差（带方向感的位移与缩放），更接近电影里的 dissolve
 * - 同时维护一个全屏柔和的"模糊背景层"做基底，避免空黑感
 * - 左右箭头切换 / 触控板横向滑动 / 触屏左右划动 / 键盘 ←→
 * - 底部圆点指示器 + 右上角计数 + 自动预加载相邻 ±1 张
 */
export default function ImageCarousel({
  images,
  heightClass = 'h-[22rem] md:h-[32rem] lg:h-[38rem]',
}: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const trackRef = useRef<HTMLDivElement>(null);
  const wheelLockRef = useRef(false);
  const navLockRef = useRef(false);

  const total = images.length;

  const navigate = (dir: 1 | -1) => {
    if (navLockRef.current || total <= 1) return;
    navLockRef.current = true;
    setDirection(dir);
    setIndex((i) => (i + dir + total) % total);
    window.setTimeout(() => {
      navLockRef.current = false;
    }, 720);
  };
  const goPrev = () => navigate(-1);
  const goNext = () => navigate(1);
  const goTo = (target: number) => {
    if (target === index || total <= 1) return;
    const dir: 1 | -1 = target > index ? 1 : -1;
    setDirection(dir);
    setIndex(target);
  };

  // 触控板横向滑动 / 鼠标滚轮（按住 Shift）
  useEffect(() => {
    const el = trackRef.current;
    if (!el || total <= 1) return;

    const onWheel = (e: WheelEvent) => {
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2;
      if (!horizontal) return;
      e.preventDefault();
      if (wheelLockRef.current) return;
      if (Math.abs(e.deltaX) < 25) return;
      wheelLockRef.current = true;
      if (e.deltaX > 0) goNext();
      else goPrev();
      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 520);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  // 触屏左右划动
  useEffect(() => {
    const el = trackRef.current;
    if (!el || total <= 1) return;

    let startX = 0;
    let startY = 0;
    let active = false;

    const onStart = (e: TouchEvent) => {
      active = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      if (!active) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      active = false;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) goNext();
        else goPrev();
      }
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchend', onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  // 键盘左右切换（聚焦时）
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
  };

  if (total === 0) return null;

  return (
    <div
      ref={trackRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={`group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] outline-none ${heightClass}`}
    >
      {/* 渐变溶解层：所有图叠放在同一坐标，用 opacity + 轻微位移/缩放完成交叉过渡 */}
      {images.map((img, i) => {
        const distance = Math.abs(i - index);
        // 仅当前与相邻 ±1 张参与渲染加载，节省内存
        const shouldLoad = distance <= 1;
        const isActive = i === index;
        const isFirst = i === 0;

        // 进入方向：当前图保持居中，非当前图根据 direction 偏移到相反一侧（呈现"层层错落"的电影感）
        // - direction=1 (前进)：旧图向左退场（-x），新图从右进入（这里所有非 active 都先退到一侧）
        // - direction=-1 (后退)：反向
        const inactiveOffset = direction === 1 ? '-2.5%' : '2.5%';
        const transform = isActive
          ? 'translate3d(0,0,0) scale(1)'
          : `translate3d(${inactiveOffset},0,0) scale(1.04)`;

        return (
          <div
            key={i}
            aria-hidden={!isActive}
            className="absolute inset-0 will-change-[opacity,transform]"
            style={{
              opacity: isActive ? 1 : 0,
              transform,
              transition:
                'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
              zIndex: isActive ? 2 : 1,
              pointerEvents: isActive ? 'auto' : 'none',
            }}
          >
            {/* 模糊填充背景：让竖图两侧不再是死黑 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shouldLoad ? img.src : undefined}
              data-src={img.src}
              alt=""
              aria-hidden
              draggable={false}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40 select-none pointer-events-none"
            />
            {/* 主图：完整展示，不裁剪 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shouldLoad ? img.src : undefined}
              data-src={img.src}
              alt={img.alt ?? `image-${i + 1}`}
              draggable={false}
              loading={isFirst ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={isFirst ? 'high' : 'low'}
              onError={(e) => {
                const el = e.currentTarget;
                if (!el.getAttribute('src')) return;
                el.style.display = 'none';
                const placeholder = el.nextElementSibling as HTMLElement | null;
                if (placeholder) placeholder.style.display = 'flex';
              }}
              className="relative z-10 w-full h-full object-contain select-none"
            />
            {/* 加载失败占位 */}
            <div
              style={{ display: 'none' }}
              className="absolute inset-0 flex flex-col items-center justify-center text-white/40 bg-gradient-to-br from-white/[0.04] to-transparent"
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-3 text-xs tracking-[0.3em] uppercase">Image Pending</div>
              <div className="mt-1 text-[10px] text-white/30 px-4 break-all text-center">
                {img.src}
              </div>
            </div>
            {img.caption && (
              <div className="absolute bottom-0 left-0 right-0 z-20 p-4 md:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white/85 text-xs md:text-sm tracking-wide">
                {img.caption}
              </div>
            )}
          </div>
        );
      })}

      {/* 左右箭头 */}
      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="上一张"
            onClick={goPrev}
            className="absolute top-1/2 left-3 md:left-5 -translate-y-1/2 z-30 inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black transition-all duration-300"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="下一张"
            onClick={goNext}
            className="absolute top-1/2 right-3 md:right-5 -translate-y-1/2 z-30 inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black transition-all duration-300"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {/* 圆点指示器 */}
      {total > 1 && (
        <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`切换到第 ${i + 1} 张`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* 角标计数 */}
      {total > 1 && (
        <div className="absolute top-4 right-4 z-30 text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/70 bg-black/40 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full tabular-nums">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
      )}
    </div>
  );
}
