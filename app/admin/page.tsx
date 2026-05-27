'use client';

import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/admin/articles"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">文章管理</h3>
          <p className="text-sm text-gray-600">创建、编辑、删除文章</p>
        </Link>
        
        <Link
          href="/admin/categories"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">分类管理</h3>
          <p className="text-sm text-gray-600">管理文章分类</p>
        </Link>
        
        <Link
          href="/admin/comments"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">评论管理</h3>
          <p className="text-sm text-gray-600">审核用户评论</p>
        </Link>
        
        <Link
          href="/admin/users"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">用户管理</h3>
          <p className="text-sm text-gray-600">管理管理员账户</p>
        </Link>
      </div>
    </div>
  );
}
