'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { get, put, del, PageResponse } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import { Loading, ErrorMessage } from '@/components/Loading';

interface Comment {
  id: number;
  content: string;
  authorName: string;
  authorEmail: string;
  articleId: number;
  articleTitle?: string;
  isApproved: boolean;
  createdAt: string;
}

type StatusFilter = 'pending' | 'approved' | 'all';

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'all', label: '全部' },
];

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusFilter>('pending');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 切换 tab 时回到第 1 页
  useEffect(() => {
    setPage(0);
  }, [status]);

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  async function loadComments() {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_ENDPOINTS.comments}/admin?status=${status}&page=${page}&size=10`;
      const result = await get<PageResponse<Comment>>(url);
      setComments(result.content);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: number) {
    try {
      await put(`${API_ENDPOINTS.comments}/${id}/approve`);
      await loadComments();
    } catch (err) {
      alert(err instanceof Error ? err.message : '审核失败');
    }
  }

  async function handleReject(id: number) {
    if (!confirm('确定要撤销该评论的审核吗？撤销后将不再对外显示。')) return;
    try {
      await put(`${API_ENDPOINTS.comments}/${id}/reject`);
      await loadComments();
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('确定要删除这条评论吗？删除后无法恢复。')) return;
    try {
      await del(`${API_ENDPOINTS.comments}/${id}`);
      await loadComments();
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">评论管理</h2>
      </div>

      {/* 状态切换 */}
      <div className="mb-4 flex gap-2 border-b border-gray-200">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatus(t.key)}
            className={`px-4 py-2 -mb-px border-b-2 transition-colors ${
              status === t.key
                ? 'border-blue-500 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading text="加载评论列表..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadComments} />
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    内容
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    所属文章
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      暂无评论
                    </td>
                  </tr>
                ) : (
                  comments.map((c) => (
                    <tr key={c.id}>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                        <div className="line-clamp-3 whitespace-pre-wrap">
                          {c.content}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-medium text-gray-900">
                          {c.authorName || '匿名'}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {c.authorEmail || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {c.articleId ? (
                          <Link
                            href={`/admin/articles/${c.articleId}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {c.articleTitle || `#${c.articleId}`}
                          </Link>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            c.isApproved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {c.isApproved ? '已通过' : '待审核'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(c.createdAt).toLocaleString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!c.isApproved ? (
                          <button
                            onClick={() => handleApprove(c.id)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            通过
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReject(c.id)}
                            className="text-yellow-600 hover:text-yellow-900 mr-4"
                          >
                            撤销
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  上一页
                </button>
                <span className="px-3 py-1">
                  第 {page + 1} / {totalPages} 页
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  下一页
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
