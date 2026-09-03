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

/** 评判状态徽标 */
function EvalBadge({ status }: { status: ThinkHistoryItem['evalStatus'] }) {
  if (status === 'DONE') {
    return <span className="text-xs px-2.5 py-0.5 rounded-full border border-emerald-400/40 text-emerald-300/90">已评判</span>;
  }
  if (status === 'EVALUATING') {
    return <span className="text-xs px-2.5 py-0.5 rounded-full border border-white/25 text-white/60 animate-pulse">评判中…</span>;
  }
  if (status === 'FAILED') {
    return <span className="text-xs px-2.5 py-0.5 rounded-full border border-red-400/40 text-red-300/90">评判失败</span>;
  }
  return null;
}

/**
 * 某一道题的作答编辑块（当前期与往期补答共用）。
 * 内部维护草稿、保存、提交与评判轮询。
 */
function AnswerEditor({
  questionId,
  initialHtml,
  initialStatus,
  initialFeedback,
  onSaved,
}: {
  questionId: number;
  initialHtml: string;
  initialStatus: ThinkHistoryItem['evalStatus'];
  initialFeedback: string | null;
  /** 保存/提交/评判结束后回传最新单题数据，父组件用来同步列表 */
  onSaved?: (item: ThinkHistoryItem) => void;
}) {
  const [draft, setDraft] = useState(initialHtml);
  const [status, setStatus] = useState(initialStatus);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [busy, setBusy] = useState<'save' | 'submit' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 评判中：每 3 秒轮询单题，直到 DONE / FAILED
  useEffect(() => {
    if (status !== 'EVALUATING') return;
    pollRef.current = setInterval(async () => {
      try {
        const item = await thinkService.getQuestion(questionId);
        if (item.evalStatus === 'DONE' || item.evalStatus === 'FAILED') {
          setStatus(item.evalStatus);
          setFeedback(item.aiFeedback);
          onSaved?.(item);
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // 轮询失败静默，下一段继续
      }
    }, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, questionId]);

  async function handle(action: 'save' | 'submit') {
    if (!draft.trim()) return;
    setBusy(action);
    setError(null);
    try {
      const item =
        action === 'save'
          ? await thinkService.saveAnswer(questionId, draft)
          : await thinkService.submit(questionId, draft);
      setStatus(item.evalStatus);
      setFeedback(item.aiFeedback);
      onSaved?.(item);
    } catch (e) {
      setError(e instanceof Error ? e.message : '操作失败，请重试');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <ThinkEditor value={draft} onChange={setDraft} />
      <div className="mt-5 flex items-center gap-4">
        <button
          onClick={() => handle('save')}
          disabled={busy !== null || !draft.trim()}
          className="px-6 py-2.5 rounded-full border border-white/25 text-white/80 text-sm hover:border-white/60 transition-colors disabled:opacity-40"
        >
          {busy === 'save' ? '保存中…' : '保存草稿'}
        </button>
        <button
          onClick={() => handle('submit')}
          disabled={busy !== null || !draft.trim() || status === 'EVALUATING'}
          className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {busy === 'submit'
            ? '提交中…'
            : status === 'EVALUATING'
              ? 'AI 评判中…'
              : status === 'DONE' || status === 'FAILED'
                ? '重新提交评判'
                : '提交并 AI 评判'}
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-red-400/80">{error}</p>}

      {status === 'EVALUATING' && (
        <p className="mt-6 text-white/50 animate-pulse">
          AI 正在阅读你的文档并评判中，通常需要 10~30 秒……
        </p>
      )}
      {status === 'FAILED' && (
        <p className="mt-6 text-red-400/80">评判失败，请重新提交一次试试。</p>
      )}
      {status === 'DONE' && feedback && (
        <div className="mt-6 border border-white/10 bg-white/[0.02] rounded-xl p-7">
          <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-5">AI 评判</p>
          <FeedbackContent markdown={feedback} />
        </div>
      )}
    </div>
  );
}

export default function ThinkPage() {
  const { isAdmin } = useIsAdmin();
  const [current, setCurrent] = useState<ThinkCurrent | null>(null);
  const [history, setHistory] = useState<ThinkHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  /** 往期里展开了补答编辑器的题目 id */
  const [answeringId, setAnsweringId] = useState<number | null>(null);
  /** 往期里展开了只读详情（作答+评判）的题目 id */
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const load = useCallback(async () => {
    try {
      const [c, h] = await Promise.all([
        thinkService.getCurrent(),
        thinkService.getHistory(),
      ]);
      setCurrent(c);
      setHistory(h);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败，请稍后再试。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRegenerate() {
    if (!confirm('换一道会清空本期的题目和已写的内容，确定吗？')) return;
    setRegenerating(true);
    setError(null);
    try {
      setCurrent(await thinkService.regenerate());
    } catch (e) {
      setError(e instanceof Error ? e.message : '出题失败');
    } finally {
      setRegenerating(false);
    }
  }

  /** 往期某题保存/提交后，同步该题数据进列表 */
  function syncHistoryItem(item: ThinkHistoryItem) {
    setHistory((prev) => prev.map((h) => (h.questionId === item.questionId ? item : h)));
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
                  <span className="flex items-center gap-3">
                    <span className="text-xs tracking-[0.25em] uppercase px-3 py-1 rounded-full border border-white/20 text-white/60">
                      {current.category}
                    </span>
                    <EvalBadge status={current.evalStatus} />
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

              {/* 本期作答区 */}
              <section className="mt-12">
                <h2 className="text-xs tracking-[0.35em] uppercase text-white/40 mb-6">
                  我的作答
                </h2>
                {isAdmin ? (
                  <AnswerEditor
                    questionId={current.questionId}
                    initialHtml={current.answerHtml ?? ''}
                    initialStatus={current.evalStatus}
                    initialFeedback={current.aiFeedback}
                    onSaved={() => {
                      // 当前期数据变化后整体刷新一次（状态/期号以服务端为准）
                      thinkService.getCurrent().then(setCurrent).catch(() => {});
                    }}
                  />
                ) : hasAnswer ? (
                  <>
                    <RichContent html={current.answerHtml!} />
                    {current.evalStatus === 'DONE' && current.aiFeedback && (
                      <div className="mt-6 border border-white/10 bg-white/[0.02] rounded-xl p-7">
                        <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-5">
                          AI 评判
                        </p>
                        <FeedbackContent markdown={current.aiFeedback} />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-white/40 italic">本期还没有作答。</p>
                )}
              </section>

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
                      const answering = answeringId === item.questionId;
                      return (
                        <li key={item.questionId} className="relative">
                          <span className="absolute -left-[37px] top-1.5 w-2.5 h-2.5 rounded-full bg-white/70" />
                          <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-3 tabular-nums">
                            第 {item.periodIndex + 1} 期 · {fmt(item.periodStart)} ~ {fmt(item.periodEnd)} · {item.category}
                          </p>
                          <p className="text-white/80 leading-[1.9] whitespace-pre-wrap mb-4">
                            {item.questionText}
                          </p>

                          <div className="flex items-center gap-5">
                            <EvalBadge status={item.evalStatus} />
                            {item.answerHtml && !answering && (
                              <button
                                onClick={() =>
                                  setExpanded((s) => ({ ...s, [item.questionId]: !open }))
                                }
                                className="text-xs tracking-[0.25em] uppercase text-white/40 hover:text-white transition-colors"
                              >
                                {open ? '收起 ↑' : '查看作答' + (item.aiFeedback ? '与评判' : '') + ' ↓'}
                              </button>
                            )}
                            {/* 管理员：未答的往期题可补答；已答的可继续修改 */}
                            {isAdmin && !answering && (
                              <button
                                onClick={() => {
                                  setAnsweringId(item.questionId);
                                  setExpanded((s) => ({ ...s, [item.questionId]: false }));
                                }}
                                className="text-xs tracking-[0.25em] uppercase text-white/40 hover:text-white transition-colors"
                              >
                                {item.answerHtml ? '继续作答 →' : '补答这道题 →'}
                              </button>
                            )}
                            {isAdmin && answering && (
                              <button
                                onClick={() => setAnsweringId(null)}
                                className="text-xs tracking-[0.25em] uppercase text-white/40 hover:text-white transition-colors"
                              >
                                收起编辑器 ↑
                              </button>
                            )}
                          </div>

                          {/* 补答/修改编辑器 */}
                          {answering && (
                            <div className="mt-6">
                              <AnswerEditor
                                questionId={item.questionId}
                                initialHtml={item.answerHtml ?? ''}
                                initialStatus={item.evalStatus}
                                initialFeedback={item.aiFeedback}
                                onSaved={syncHistoryItem}
                              />
                            </div>
                          )}

                          {/* 只读展开：作答 + 评判 */}
                          {open && !answering && item.answerHtml && (
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
