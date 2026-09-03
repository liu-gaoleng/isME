'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ThinkEditor from '@/components/ThinkEditor';
import { useIsAdmin } from '@/lib/api/useAuth';
import {
  thinkService,
  type ThinkCurrent,
  type ThinkHistoryItem,
} from '@/lib/api/think';

const fmt = (d: string) => d.replace(/-/g, '.');

/** 作答文档（TipTap HTML）的只读渲染 */
function RichContent({ html }: { html: string }) {
  return <div className="think-rich" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** AI 评判（Markdown）渲染 */
function FeedbackContent({ markdown }: { markdown: string }) {
  return (
    <div className="think-rich">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}

export default function ThinkPage() {
  const { isAdmin } = useIsAdmin();
  const [current, setCurrent] = useState<ThinkCurrent | null>(null);
  const [history, setHistory] = useState<ThinkHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const [c, h] = await Promise.all([
        thinkService.getCurrent(),
        thinkService.getHistory(),
      ]);
      setCurrent(c);
      setHistory(h);
      setDraft((prev) => prev || c.answerHtml || '');
      setError(null);
      return c;
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败，请稍后再试。');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // 评判中：每 3 秒轮询，直到 DONE / FAILED
  useEffect(() => {
    if (current?.evalStatus !== 'EVALUATING') {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      return;
    }
    pollRef.current = setInterval(async () => {
      try {
        const c = await thinkService.getCurrent();
        setCurrent(c);
        if (c.evalStatus === 'DONE' || c.evalStatus === 'FAILED') {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch {
        // 轮询失败静默，下一段继续
      }
    }, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [current?.evalStatus]);

  async function handleSave() {
    if (!draft.trim()) return;
    setSaving(true);
    setError(null);
    try {
      setCurrent(await thinkService.saveAnswer(draft));
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!draft.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      setCurrent(await thinkService.submit(draft));
    } catch (e) {
      setError(e instanceof Error ? e.message : '提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegenerate() {
    if (!confirm('换一道会清空本期的题目和已写的内容，确定吗？')) return;
    setRegenerating(true);
    setError(null);
    try {
      const c = await thinkService.regenerate();
      setCurrent(c);
      setDraft('');
    } catch (e) {
      setError(e instanceof Error ? e.message : '出题失败');
    } finally {
      setRegenerating(false);
    }
  }

  const hasAnswer = !!current?.answerHtml;

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

          <p className="text-xs tracking-[0.35em] uppercase text-white/40 mb-6">
            思考一下 · 第 {current ? current.periodIndex + 1 : '…'} 期
            {current && (
              <span className="ml-3 tabular-nums normal-case tracking-normal">
                {fmt(current.periodStart)} ~ {fmt(current.periodEnd)}
              </span>
            )}
          </p>

          {loading ? (
            <p className="text-white/45">加载中……</p>
          ) : current ? (
            <>
              {/* 本期题目 */}
              <div className="border border-white/10 bg-white/[0.02] rounded-xl p-7">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <span className="text-xs tracking-[0.25em] uppercase px-3 py-1 rounded-full border border-white/20 text-white/60">
                    {current.category}
                  </span>
                  {isAdmin && current.aiAvailable && (
                    <button
                      onClick={handleRegenerate}
                      disabled={regenerating}
                      className="text-xs tracking-[0.2em] uppercase text-white/35 hover:text-white transition-colors disabled:opacity-40"
                    >
                      {regenerating ? '出题中…' : '换一道'}
                    </button>
                  )}
                </div>
                <p className="text-lg md:text-xl leading-[1.9] text-white/90 whitespace-pre-wrap">
                  {current.questionText}
                </p>
              </div>

              {!current.aiAvailable && (
                <p className="mt-6 text-sm text-amber-300/80">
                  AI 服务未配置，暂时无法出题与评判。
                </p>
              )}

              {/* 作答区 */}
              <section className="mt-12">
                <h2 className="text-xs tracking-[0.35em] uppercase text-white/40 mb-6">
                  我的作答
                </h2>
                {isAdmin ? (
                  <div>
                    <ThinkEditor value={draft} onChange={setDraft} />
                    <div className="mt-5 flex items-center gap-4">
                      <button
                        onClick={handleSave}
                        disabled={saving || submitting || !draft.trim()}
                        className="px-6 py-2.5 rounded-full border border-white/25 text-white/80 text-sm hover:border-white/60 transition-colors disabled:opacity-40"
                      >
                        {saving ? '保存中…' : '保存草稿'}
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={saving || submitting || !draft.trim() || current.evalStatus === 'EVALUATING'}
                        className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
                      >
                        {submitting
                          ? '提交中…'
                          : current.evalStatus === 'EVALUATING'
                            ? 'AI 评判中…'
                            : '提交并 AI 评判'}
                      </button>
                    </div>
                  </div>
                ) : hasAnswer ? (
                  <RichContent html={current.answerHtml!} />
                ) : (
                  <p className="text-white/40 italic">本期还没有作答。</p>
                )}
              </section>

              {/* AI 评判 */}
              {(current.evalStatus !== 'NONE' || current.aiFeedback) && (
                <section className="mt-12">
                  <h2 className="text-xs tracking-[0.35em] uppercase text-white/40 mb-6">
                    AI 评判
                  </h2>
                  {current.evalStatus === 'EVALUATING' ? (
                    <p className="text-white/50 animate-pulse">
                      AI 正在阅读你的文档并评判中，通常需要 10~30 秒……
                    </p>
                  ) : current.evalStatus === 'FAILED' ? (
                    <p className="text-red-400/80">
                      评判失败，请重新提交一次试试。
                    </p>
                  ) : current.aiFeedback ? (
                    <div className="border border-white/10 bg-white/[0.02] rounded-xl p-7">
                      <FeedbackContent markdown={current.aiFeedback} />
                    </div>
                  ) : null}
                </section>
              )}

              {error && <p className="mt-6 text-sm text-red-400/80">{error}</p>}

              {/* 往期 */}
              {history.length > 0 && (
                <section className="mt-24">
                  <h2 className="text-xs tracking-[0.35em] uppercase text-white/40 mb-10">
                    往期
                  </h2>
                  <ul className="relative border-l border-white/15 pl-8 space-y-14">
                    {history.map((item) => {
                      const open = !!expanded[item.questionId];
                      return (
                        <li key={item.questionId} className="relative">
                          <span className="absolute -left-[37px] top-1.5 w-2.5 h-2.5 rounded-full bg-white/70" />
                          <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-3 tabular-nums">
                            第 {item.periodIndex + 1} 期 · {fmt(item.periodStart)} ~ {fmt(item.periodEnd)} · {item.category}
                          </p>
                          <p className="text-white/80 leading-[1.9] whitespace-pre-wrap mb-4">
                            {item.questionText}
                          </p>
                          {item.answerHtml && (
                            <button
                              onClick={() =>
                                setExpanded((s) => ({ ...s, [item.questionId]: !open }))
                              }
                              className="text-xs tracking-[0.25em] uppercase text-white/40 hover:text-white transition-colors"
                            >
                              {open ? '收起 ↑' : '查看作答与评判 ↓'}
                            </button>
                          )}
                          {open && item.answerHtml && (
                            <div className="mt-6 space-y-8">
                              <RichContent html={item.answerHtml} />
                              {item.aiFeedback && (
                                <div className="border border-white/10 bg-white/[0.02] rounded-xl p-7">
                                  <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-5">
                                    AI 评判
                                  </p>
                                  <FeedbackContent markdown={item.aiFeedback} />
                                </div>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </>
          ) : (
            <p className="text-white/45">{error ?? '暂无内容。'}</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
