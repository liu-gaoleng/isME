'use client';

import { useEffect, useRef, useState } from 'react';

interface ImageCarouselProps {
  images: { src: string; alt?: string; caption?: string }[];
  /** 图片框的高度类（Tailwind） */
  heightClass?: string;
}

/**
 * 丝滑的图片轮播：
 * - 左右箭头切换
 * - 鼠标拖拽 / 触控板横向滑动 / 触屏左右划动
 * - 底部圆点指示器
 * - 切换有缓动过渡
 * - 图片以 object-contain 完整展示（横竖图皆不裁剪），左右留黑底
 */
export default function ImageCarousel({
  images,
  heightClass = 'h-[22rem] md:h-[32rem] lg:h-[38rem]',
}: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const wheelLockRef = useRef(false);

  const total = images.length;
  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  // 触控板横向滑动 / 鼠标滚轮（按住 Shift）
  useEffect(() => {
    const el = trackRef.current;
    if (!el || total <= 1) return;

    const onWheel = (e: WheelEvent) => {
      // 仅在水平方向位移更明显时拦截，避免影响垂直滚动
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
      }, 420);
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
      className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] outline-none"
    >
      {/* 滑动轨道 */}
      <div
        className={`flex w-full ${heightClass} transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform`}
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((img, i) => {
          // 只为当前及相邻 ±1 张「真实加载」，其余使用 lazy + 不写入 src，等到接近时再加载
          const distance = Math.abs(i - index);
          const shouldLoad = distance <= 1;
          // 第一张（首屏）用 eager + high 优先级，其余统统 lazy
          const isFirst = i === 0;
          return (
          <div
            key={i}
            className="relative flex-shrink-0 w-full h-full bg-black overflow-hidden"
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
                // 若 src 为空就不当作错误
                if (!el.getAttribute('src')) return;
                el.style.display = 'none';
                const placeholder = el.nextElementSibling as HTMLElement | null;
                if (placeholder) placeholder.style.display = 'flex';
              }}
              className="relative z-10 w-full h-full object-contain select-none"
            />
            {/* 加载失败时的占位（默认隐藏） */}
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
      </div>

      {/* 左右箭头 */}
      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="上一张"
            onClick={goPrev}
            className="absolute top-1/2 left-3 md:left-5 -translate-y-1/2 z-10 inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black transition-all duration-300"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="下一张"
            onClick={goNext}
            className="absolute top-1/2 right-3 md:right-5 -translate-y-1/2 z-10 inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black transition-all duration-300"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {/* 圆点指示器 */}
      {total > 1 && (
        <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`切换到第 ${i + 1} 张`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* 角标计数 */}
      {total > 1 && (
        <div className="absolute top-4 right-4 z-10 text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/70 bg-black/40 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full tabular-nums">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
      )}
    </div>
  );
}
