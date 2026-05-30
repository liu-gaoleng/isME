'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface NavbarProps {
  /** 是否启用透明模式（用于首页 Hero 区域） */
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!transparent) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparent]);

  // 是否需要显示透明样式
  const isTransparent = transparent && !scrolled;

  const baseLinkClass = 'inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors';

  return (
    <nav
      className={`top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? 'fixed'
          : 'sticky bg-white shadow-sm'
      } ${
        isTransparent
          ? 'bg-transparent'
          : transparent
          ? 'bg-white/95 backdrop-blur shadow-sm'
          : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span
                className={`text-xl font-bold transition-colors ${
                  isTransparent ? 'text-white' : 'text-gray-900'
                }`}
              >
                我的个人网站
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`${baseLinkClass} ${
                  isTransparent
                    ? 'text-white hover:text-white/80'
                    : 'text-gray-900 hover:text-gray-700'
                }`}
              >
                首页
              </Link>
              <Link
                href="/blog"
                className={`${baseLinkClass} ${
                  isTransparent
                    ? 'text-white/90 hover:text-white'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                博客
              </Link>
              <Link
                href="/about"
                className={`${baseLinkClass} ${
                  isTransparent
                    ? 'text-white/90 hover:text-white'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                关于
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Link
              href="/admin"
              className={`text-sm font-medium transition-colors ${
                isTransparent
                  ? 'text-white/90 hover:text-white'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              管理后台
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
