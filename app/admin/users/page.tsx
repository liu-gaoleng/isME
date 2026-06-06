'use client';

import { useEffect, useState } from 'react';
import { get, post, put, del } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import { getMe } from '@/lib/api/auth';
import { Loading, ErrorMessage } from '@/components/Loading';

interface User {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  role: string;
  enabled: boolean;
}

interface CreateForm {
  username: string;
  email: string;
  password: string;
  nickname: string;
  role: string;
}

const EMPTY_CREATE: CreateForm = {
  username: '',
  email: '',
  password: '',
  nickname: '',
  role: 'ADMIN',
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<{ id?: number; username?: string } | null>(null);

  // 新建用户表单
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // 重置密码弹窗
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    // 读取当前登录账号，避免误把自己禁用/降权/删除。
    // 凭证为 HttpOnly Cookie，改为调用 /api/auth/me 获取当前用户。
    getMe()
      .then((u) => setMe({ id: u.id, username: u.username }))
      .catch(() => {
        /* 未登录由布局守卫处理，这里忽略 */
      });
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const data = await get<User[]>(API_ENDPOINTS.users);
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }

  function isSelf(u: User) {
    return me?.id === u.id || me?.username === u.username;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.username.trim() || !createForm.email.trim() || !createForm.password) {
      setCreateError('用户名、邮箱、密码均为必填');
      return;
    }
    if (createForm.password.length < 6) {
      setCreateError('密码至少 6 位');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      await post(API_ENDPOINTS.users, {
        username: createForm.username.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        nickname: createForm.nickname.trim() || createForm.username.trim(),
        role: createForm.role,
      });
      setCreateForm(EMPTY_CREATE);
      await loadUsers();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : '创建失败');
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleEnabled(u: User) {
    if (isSelf(u)) {
      alert('不能停用当前登录的账号');
      return;
    }
    const next = !u.enabled;
    if (!confirm(`确定要${next ? '启用' : '停用'}账号「${u.username}」吗？`)) return;
    try {
      await put(`${API_ENDPOINTS.users}/${u.id}`, { enabled: next });
      await loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败');
    }
  }

  async function handleToggleRole(u: User) {
    if (isSelf(u)) {
      alert('不能修改当前登录账号的角色');
      return;
    }
    const next = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`确定要将「${u.username}」的角色切换为 ${next} 吗？`)) return;
    try {
      await put(`${API_ENDPOINTS.users}/${u.id}`, { role: next });
      await loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败');
    }
  }

  async function handleDelete(u: User) {
    if (isSelf(u)) {
      alert('不能删除当前登录的账号');
      return;
    }
    if (!confirm(`确定要删除账号「${u.username}」吗？此操作不可恢复。`)) return;
    try {
      await del(`${API_ENDPOINTS.users}/${u.id}`);
      await loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  }

  function openReset(u: User) {
    setResetTarget(u);
    setResetPassword('');
    setResetError(null);
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetTarget) return;
    if (resetPassword.length < 6) {
      setResetError('密码至少 6 位');
      return;
    }
    setResetting(true);
    setResetError(null);
    try {
      await put(`${API_ENDPOINTS.users}/${resetTarget.id}`, { password: resetPassword });
      setResetTarget(null);
      setResetPassword('');
    } catch (err) {
      setResetError(err instanceof Error ? err.message : '重置失败');
    } finally {
      setResetting(false);
    }
  }

  if (loading) return <Loading text="加载用户列表..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadUsers} />;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">用户管理</h2>
      </div>

      {/* 新建用户 */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-lg shadow p-6 mb-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-900">新建账号</h3>
        {createError && <ErrorMessage message={createError} />}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              用户名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={createForm.username}
              onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="登录用户名（唯一）"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮箱 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="登录邮箱（唯一）"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="至少 6 位"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
            <input
              type="text"
              value={createForm.nickname}
              onChange={(e) => setCreateForm({ ...createForm, nickname: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="留空则使用用户名"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
            <select
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ADMIN">ADMIN（管理员）</option>
              <option value="USER">USER（普通用户）</option>
            </select>
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {creating ? '创建中...' : '创建'}
          </button>
        </div>
      </form>

      {/* 用户列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用户名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                邮箱
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                昵称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                角色
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  暂无用户
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const self = isSelf(u);
                return (
                  <tr key={u.id} className={self ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {u.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {u.username}
                      {self && (
                        <span className="ml-2 text-xs text-blue-600">（当前账号）</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {u.nickname || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          u.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.enabled ? '已启用' : '已停用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleToggleRole(u)}
                        disabled={self}
                        className="text-blue-600 hover:text-blue-900 mr-3 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {u.role === 'ADMIN' ? '降为 USER' : '升为 ADMIN'}
                      </button>
                      <button
                        onClick={() => handleToggleEnabled(u)}
                        disabled={self}
                        className="text-yellow-600 hover:text-yellow-900 mr-3 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {u.enabled ? '停用' : '启用'}
                      </button>
                      <button
                        onClick={() => openReset(u)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        重置密码
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={self}
                        className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 重置密码弹窗 */}
      {resetTarget && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={() => !resetting && setResetTarget(null)}
        >
          <form
            onSubmit={handleResetPassword}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              重置「{resetTarget.username}」的密码
            </h3>
            {resetError && <ErrorMessage message={resetError} />}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                新密码（至少 6 位）
              </label>
              <input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                autoFocus
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setResetTarget(null)}
                disabled={resetting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={resetting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {resetting ? '提交中...' : '确认重置'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
