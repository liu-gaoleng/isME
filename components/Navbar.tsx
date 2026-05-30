'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface NavbarProps {
  /** 是否启用透明模式（用于首页 Hero 区域） */
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      // 透明 → 实色 切换：滚过 80px 即添加深色背景（仅 transparent 模式）
      if (transparent) setScrolled(y > 80);

      // 接近页面底部时隐藏顶栏（距底部 < 120px）
      const distanceFromBottom =
        document.documentElement.scrollHeight - (y + window.innerHeight);
      setHidden(distanceFromBottom < 120);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [transparent]);

  // 滚动后或非透明模式下，添加深色磨砂背景；首屏透明时直接叠加在视频上
  const isTransparent = transparent && !scrolled;

  const navLinks = [
    { href: '/blog', label: '作品' },
    { href: '/#hobbies', label: '爱好' },
    { href: '/about', label: '经历' },
    { href: '/admin', label: '管理' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-[background,border,box-shadow,opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-black/80 backdrop-blur-md border-b border-white/10'
      } ${hidden ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}
    >
      <div className="px-6 sm:px-10 lg:px-14">
        <div className="flex justify-between items-center h-20 md:h-24">
          {/* 左上角：大号 Liu Logo */}
          <Link
            href="/"
            className="text-white font-extrabold tracking-tight leading-none select-none"
          >
            <span className="text-4xl md:text-5xl lg:text-6xl">Liu</span>
          </Link>

          {/* 右上角：苹果控制中心风格胶囊导航 */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2 p-1.5 rounded-full bg-white/[0.07] border border-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] hover:bg-white/[0.1] hover:border-white/20 transition-[background,border,box-shadow] duration-500">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="control-pill"
              >
                <span aria-hidden className="control-pill__glow" />
                <span aria-hidden className="control-pill__shine" />
                <span aria-hidden className="control-pill__ring" />
                <span className="control-pill__label">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* 移动端菜单按钮 */}
          <button
            type="button"
            aria-label="切换菜单"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden inline-flex flex-col justify-center items-center w-10 h-10 gap-1.5 text-white"
          >
            <span
              className={`block w-6 h-px bg-white transition-transform duration-300 ${
                menuOpen ? 'translate-y-[6px] rotate-45' : ''
              }`}
            />
            <span
              className={`block w-6 h-px bg-white transition-opacity duration-300 ${
                menuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`block w-6 h-px bg-white transition-transform duration-300 ${
                menuOpen ? '-translate-y-[6px] -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* 移动端展开层 */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-500 bg-black/95 backdrop-blur-md ${
          menuOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="px-6 py-6 flex flex-col gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-white/85 text-base tracking-wider uppercase hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
