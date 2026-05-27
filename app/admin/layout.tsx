'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">管理后台</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-4">
              管理后台功能开发中...
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>文章管理</li>
              <li>分类管理</li>
              <li>评论管理</li>
              <li>用户管理</li>
            </ul>
          </div>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
