'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useIsAdmin } from '@/lib/api/useAuth';
import {
  questionService,
  type DailyQuestionToday,
  type QuestionAnswerItem,
} from '@/lib/api/question';

const fmt = (d: string) => d.replace(/-/g, '.');

export default function DailyQuestionPage() {
  const { isAdmin } = useIsAdmin();
  const [today, setToday] = useState<DailyQuestionToday | null>(null);
  const [history, setHistory] = useState<QuestionAnswerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, h] = await Promise.all([
        questionService.getToday(),
        questionService.getAnswers(),
      ]);
      setToday(t);
      setHistory(h);
      setDraft(t.answer ?? '');
    } catch {
      setError('加载失败，请稍后再试。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    if (!draft.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await questionService.answerToday(draft.trim());
      setEditing(false);
      await load();
    } catch {
      setError('保存失败，请确认已登录后重试。');
    } finally {
      setSaving(false);
    }
  }

  // 历史时间线里剔除今天（今天单独在顶部展示）
  const pastHistory = history.filter((h) => h.date !== today?.date);

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
            每日一问 · {today ? fmt(today.date) : '……'}
          </p>

          {loading ? (
            <p className="text-white/45">加载中……</p>
          ) : today ? (
            <>
              {/* 今日题目 */}
              <h1 className="text-3xl md:text-4xl font-extrabold leading-snug tracking-tight">
                {today.text}
              </h1>

              {/* 回答区 */}
              <div className="mt-10">
                {today.answered && !editing ? (
                  <div className="border-l-2 border-white/25 pl-6">
                    <p className="text-white/85 text-lg leading-[1.9] whitespace-pre-wrap">
                      {today.answer}
                    </p>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setDraft(today.answer ?? '');
                          setEditing(true);
                        }}
                        className="mt-5 text-xs tracking-[0.3em] uppercase text-white/40 hover:text-white transition-colors"
                      >
                        修改回答
                      </button>
                    )}
                  </div>
                ) : isAdmin ? (
                  <div>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={6}
                      placeholder="写下此刻的答案……"
                      className="w-full bg-white/[0.03] border border-white/15 focus:border-white/50 outline-none rounded-lg p-4 text-white/90 text-lg leading-[1.8] resize-y transition-colors"
                    />
                    <div className="mt-4 flex items-center gap-4">
                      <button
                        onClick={handleSave}
                        disabled={saving || !draft.trim()}
                        className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
                      >
                        {saving ? '保存中…' : '保存'}
                      </button>
                      {editing && (
                        <button
                          onClick={() => {
                            setEditing(false);
                            setDraft(today.answer ?? '');
                          }}
                          className="text-sm text-white/50 hover:text-white transition-colors"
                        >
                          取消
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-white/40 italic">今天还没有作答。</p>
                )}
                {error && <p className="mt-4 text-sm text-red-400/80">{error}</p>}
              </div>

              {/* 往期问答 */}
              {pastHistory.length > 0 && (
                <section className="mt-24">
                  <h2 className="text-xs tracking-[0.35em] uppercase text-white/40 mb-10">
                    往期
                  </h2>
                  <ul className="relative border-l border-white/15 pl-8 space-y-14">
                    {pastHistory.map((item) => (
                      <li key={item.date} className="relative">
                        <span className="absolute -left-[37px] top-1.5 w-2.5 h-2.5 rounded-full bg-white/70" />
                        <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-3 tabular-nums">
                          {fmt(item.date)}
                        </p>
                        <h3 className="text-lg md:text-xl font-bold text-white/90 tracking-tight mb-3">
                          {item.questionText}
                        </h3>
                        <p className="text-white/65 leading-[1.9] whitespace-pre-wrap">
                          {item.answerText}
                        </p>
                      </li>
                    ))}
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
