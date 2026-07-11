'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useIsAdmin } from '@/lib/api/useAuth';
import { happyService, type HappyMoment } from '@/lib/api/happy';

const fmt = (d: string) => d.replace(/-/g, '.');

export default function JoyPage() {
  const { isAdmin } = useIsAdmin();
  const [moments, setMoments] = useState<HappyMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMoments(await happyService.list());
    } catch {
      setMoments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  async function handleAdd() {
    if (!draft.trim()) return;
    setSubmitting(true);
    try {
      await happyService.create({ content: draft.trim() });
      setDraft('');
      setAdding(false);
      await load();
    } catch {
      /* 保留草稿以便重试 */
    } finally {
      setSubmitting(false);
    }
  }

  function cancelAdd() {
    setAdding(false);
    setDraft('');
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-14">
          <Link
            href="/me"
            className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-white/40 hover:text-white transition-colors mb-10"
          >
            <span>←</span> me
          </Link>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">小确幸</h1>

          <div className="mt-12">
            {loading ? (
              <p className="text-white/45">加载中……</p>
            ) : (
              <ul className="relative border-l border-white/15 pl-8 space-y-10">
                {/* 低调的内联新增入口（仅本人可见） */}
                {isAdmin && (
                  <li className="relative">
                    {adding ? (
                      <>
                        <span className="absolute -left-[37px] top-1.5 w-2.5 h-2.5 rounded-full bg-amber-300/80" />
                        <textarea
                          ref={inputRef}
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          rows={3}
                          placeholder="今天有什么让你开心的小事？"
                          className="w-full bg-white/[0.03] border border-white/15 focus:border-white/50 outline-none rounded-lg p-3 text-white/90 leading-[1.8] resize-y transition-colors"
                        />
                        <div className="mt-2 flex items-center gap-3 text-sm">
                          <button
                            onClick={handleAdd}
                            disabled={submitting || !draft.trim()}
                            className="text-amber-300/90 hover:text-amber-200 disabled:opacity-40 transition-colors"
                          >
                            {submitting ? '记录中…' : '记下'}
                          </button>
                          <button
                            onClick={cancelAdd}
                            className="text-white/40 hover:text-white transition-colors"
                          >
                            取消
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="absolute -left-[37px] top-1.5 w-2.5 h-2.5 rounded-full border border-white/25" />
                        <button
                          onClick={() => setAdding(true)}
                          className="text-sm text-white/30 hover:text-white/80 transition-colors"
                        >
                          ＋ 记下一件开心的小事
                        </button>
                      </>
                    )}
                  </li>
                )}

                {moments.map((m) => (
                  <li key={m.id} className="relative group">
                    <span className="absolute -left-[37px] top-1.5 w-2.5 h-2.5 rounded-full bg-amber-300/80 shadow-[0_0_14px_rgba(252,211,77,0.5)]" />
                    <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-2 tabular-nums">
                      {fmt(m.happenedOn)}
                    </p>
                    <p className="text-white/85 text-lg leading-[1.85] whitespace-pre-wrap">
                      {m.content}
                    </p>
                    {isAdmin && (
                      <button
                        onClick={async () => {
                          if (!confirm('删除这条记录？')) return;
                          try {
                            await happyService.remove(m.id);
                            await load();
                          } catch {
                            /* ignore */
                          }
                        }}
                        className="mt-2 text-xs text-white/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        删除
                      </button>
                    )}
                  </li>
                ))}

                {moments.length === 0 && !isAdmin && (
                  <li className="relative">
                    <span className="absolute -left-[37px] top-1.5 w-2.5 h-2.5 rounded-full bg-white/20" />
                    <p className="text-white/45">还没有记录。</p>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
