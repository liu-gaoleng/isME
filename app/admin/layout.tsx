'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { isAuthenticated, removeAuthToken } from '@/lib/api/auth';

// 后台子模块导航：单独一个数组方便后续增减模块
const ADMIN_NAV = [
  { href: '/admin', label: '总览' },
  { href: '/admin/articles', label: '文章管理' },
  { href: '/admin/categories', label: '分类管理' },
  { href: '/admin/comments', label: '评论管理' },
  { href: '/admin/users', label: '用户管理' },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setAuthorized(true);
  }, [router, pathname]);

  function handleLogout() {
    removeAuthToken();
    localStorage.removeItem('authUser');
    router.replace('/login');
  }

  // 未通过鉴权前不渲染后台内容，避免敏感界面闪现
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <span className="text-gray-500">正在验证登录状态...</span>
      </div>
    );
  }

  // 高亮规则：/admin 仅匹配自身；其它子路径用 startsWith 以兼容 /admin/articles/create 等子路由
  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">管理后台</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              退出登录
            </button>
          </div>
          <nav className="mb-8 border-b border-gray-200">
            <ul className="flex flex-wrap gap-1 -mb-px">
              {ADMIN_NAV.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`inline-block px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        active
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
