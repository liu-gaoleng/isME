'use client';

import { useEffect, useState } from 'react';

/**
 * 页面尾声：作为正常页面的最后一段（不是固定浮层），
 * - 左下：放大的 "This is me"
 * - 右下：实时心跳计时器（与鼠标颜色一致的绿色脉冲）
 */
export default function Footer() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setTime(`${hh}:${mm}:${ss}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="relative bg-black text-white mt-auto">
      <div className="px-6 sm:px-10 lg:px-14 pt-20 md:pt-28 pb-10 md:pb-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-12">
          {/* 左下：This is me（放大） */}
          <div className="flex items-end gap-5 md:gap-7">
            <span
              aria-hidden
              className="block w-12 md:w-20 h-px bg-white/40 mb-4 md:mb-6"
            />
            <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95]">
              This is me
            </h2>
          </div>

          {/* 右下：实时心跳计时器 */}
          <div className="flex flex-col items-start md:items-end gap-3 md:gap-4 select-none">
            <div className="text-[10px] md:text-[11px] tracking-[0.45em] uppercase text-white/45">
              Beating · Still Coding
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <span className="relative inline-flex w-2.5 h-2.5">
                <span className="absolute inset-0 rounded-full bg-[var(--cursor-green,#22e07a)] animate-ping opacity-70" />
                <span className="relative inline-block w-2.5 h-2.5 rounded-full bg-[var(--cursor-green,#22e07a)] shadow-[0_0_18px_rgba(34,224,122,0.7)]" />
              </span>
              <span className="text-2xl md:text-3xl font-semibold tracking-[0.18em] tabular-nums text-white">
                {time}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
