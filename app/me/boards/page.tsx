'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useIsAdmin } from '@/lib/api/useAuth';
import { boardService, type Board } from '@/lib/api/board';
import type { SaveStatus } from '@/components/BoardCanvas';

const SAVE_LABEL: Record<SaveStatus, string> = {
  idle: '自动保存已开启',
  saving: '保存中…',
  saved: '已保存 ✓',
  error: '保存失败',
};

// Excalidraw 依赖 window，必须禁用 SSR 动态加载
const BoardCanvas = dynamic(() => import('@/components/BoardCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-white/40">画布加载中……</div>
  ),
});

export default function BoardsWorkspace() {
  const { isAdmin, checking } = useIsAdmin();
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [current, setCurrent] = useState<Board | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [title, setTitle] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [flush, setFlush] = useState(0);

  const loadList = useCallback(async (preferId?: number) => {
    setLoadingList(true);
    try {
      const list = await boardService.list();
      setBoards(list);
      setSelectedId((prev) => {
        if (preferId && list.some((b) => b.id === preferId)) return preferId;
        if (prev && list.some((b) => b.id === prev)) return prev;
        return list[0]?.id ?? null;
      });
    } catch {
      setBoards([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  // 选中变化时拉取完整画板（含 sceneJson）
  useEffect(() => {
    if (selectedId == null) {
      setCurrent(null);
      return;
    }
    let cancelled = false;
    setLoadingBoard(true);
    setSaveStatus('idle');
    boardService
      .getById(selectedId)
      .then((b) => {
        if (cancelled) return;
        setCurrent(b);
        setTitle(b.title);
      })
      .catch(() => {
        if (!cancelled) setCurrent(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingBoard(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  async function handleCreate() {
    try {
      const b = await boardService.create({ title: '未命名画板' });
      await loadList(b.id);
    } catch {
      /* ignore */
    }
  }

  async function handleDelete(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    if (!confirm('删除这块画板吗？此操作不可撤销。')) return;
    try {
      await boardService.remove(id);
      await loadList();
    } catch {
      /* ignore */
    }
  }

  const handleSaveScene = useCallback(
    async (sceneJson: string) => {
      if (selectedId == null) return;
      await boardService.update(selectedId, { sceneJson });
    },
    [selectedId]
  );

  async function handleTitleBlur() {
    if (!current) return;
    const t = title.trim();
    if (!t || t === current.title) {
      setTitle(current.title);
      return;
    }
    try {
      const updated = await boardService.update(current.id, { title: t });
      setCurrent(updated);
      setBoards((prev) =>
        prev.map((b) => (b.id === updated.id ? { ...b, title: updated.title } : b))
      );
    } catch {
      setTitle(current.title);
    }
  }

  // 单块画板对访客直接铺满；多块或本人时才显示左侧列表
  const showSidebar = isAdmin || boards.length >= 2;
  const canvasReady =
    current != null && current.id === selectedId && !loadingBoard;

  return (
    <div className="fixed inset-0 flex flex-col bg-black text-white">
      {/* 顶部细条 */}
      <header className="shrink-0 flex items-center gap-4 px-4 sm:px-6 h-14 border-b border-white/10 bg-black/80 backdrop-blur">
        <Link
          href="/me"
          className="text-xs tracking-[0.3em] uppercase text-white/50 hover:text-white transition-colors"
        >
          ← me
        </Link>
        {current && (
          <>
            <span className="w-px h-5 bg-white/15" />
            {isAdmin ? (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="未命名画板"
                className="bg-transparent outline-none text-white/90 font-semibold text-base w-full max-w-xs border-b border-transparent focus:border-white/30 transition-colors"
              />
            ) : (
              <span className="text-white/90 font-semibold text-base">{current.title}</span>
            )}
          </>
        )}

        {/* 保存状态放在顶栏，避开 Excalidraw 自带的四角控件 */}
        {isAdmin && current && (
          <div className="ml-auto flex items-center gap-3 text-xs text-white/55 shrink-0">
            <span>{SAVE_LABEL[saveStatus]}</span>
            <button
              onClick={() => setFlush((n) => n + 1)}
              className="text-white/85 hover:text-white underline underline-offset-2"
            >
              立即保存
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 min-h-0 flex">
        {/* 左侧画板列表 */}
        {showSidebar && (
          <aside className="shrink-0 w-52 border-r border-white/10 bg-white/[0.02] flex flex-col">
            <div className="flex items-center justify-between px-4 h-11 shrink-0 text-xs tracking-[0.25em] uppercase text-white/35">
              <span>画板</span>
              {isAdmin && (
                <button
                  onClick={handleCreate}
                  aria-label="新建画板"
                  className="text-white/40 hover:text-white text-lg leading-none transition-colors"
                >
                  ＋
                </button>
              )}
            </div>
            <ul className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
              {boards.map((b) => {
                const active = b.id === selectedId;
                return (
                  <li key={b.id}>
                    <button
                      onClick={() => setSelectedId(b.id)}
                      className={`group w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        active
                          ? 'bg-white/10 text-white'
                          : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="truncate flex-1">{b.title}</span>
                      {isAdmin && (
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label="删除画板"
                          onClick={(e) => handleDelete(e, b.id)}
                          className="shrink-0 text-white/25 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-base leading-none"
                        >
                          ×
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
              {boards.length === 0 && !loadingList && (
                <li className="px-3 py-2 text-sm text-white/35">
                  {isAdmin ? '点上方 ＋ 新建' : '暂无画板'}
                </li>
              )}
            </ul>
          </aside>
        )}

        {/* 主区：当前画板 */}
        <main className="flex-1 min-h-0 flex flex-col">
          {loadingList || checking ? (
            <div className="flex-1 flex items-center justify-center text-white/40">加载中……</div>
          ) : boards.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/45">
              <p>还没有画板。</p>
              {isAdmin && (
                <button
                  onClick={handleCreate}
                  className="px-5 py-2 rounded-full border border-white/20 text-sm text-white/80 hover:bg-white/10 transition-colors"
                >
                  新建一块画板
                </button>
              )}
            </div>
          ) : canvasReady ? (
            <BoardCanvas
              key={current.id}
              initialSceneJson={current.sceneJson ?? null}
              readOnly={!isAdmin}
              onSave={handleSaveScene}
              onStatusChange={setSaveStatus}
              flushSignal={flush}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/40">画布加载中……</div>
          )}
        </main>
      </div>
    </div>
  );
}
