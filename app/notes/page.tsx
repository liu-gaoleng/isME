'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { notes, type NoteType } from '@/lib/notes';

const TABS: { key: NoteType; label: string; intro: string }[] = [
  {
    key: 'musing',
    label: '碎碎念',
    intro: '不必完整，也值得被记下来。',
  },
  {
    key: 'essay',
    label: '知识',
    intro: '结构完整的思考与笔记 —— 教给别人，也是教给自己。',
  },
];

export default function NotesPage() {
  const [activeTab, setActiveTab] = useState<NoteType>('musing');
  // 传入 activeTab：切换 Tab 时重新扫描新渲染的 .reveal 元素
  useScrollReveal([activeTab]);

  const visibleNotes = useMemo(
    () => notes.filter((n) => n.type === activeTab),
    [activeTab]
  );

  const activeMeta = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-14">
          {/* 页头 */}
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-12 reveal">
            笔记
          </h1>

          {/* 引语 */}
          <section className="max-w-3xl">
            <p className="text-2xl md:text-3xl font-semibold leading-snug text-white tracking-tight reveal">
              {activeMeta.intro}
            </p>
            {activeTab === 'essay' && (
              <div className="mt-8 space-y-5 text-white/75 text-base md:text-lg leading-[1.9] reveal reveal-delay-1">
                <p>
                  这里收录有架构、有逻辑、可复用的知识——技术原理、读书心得、方法论。
                  如果说&ldquo;碎碎念&rdquo;是火花，这里就是被收进炉子里、能再次取暖的木头。
                </p>
                <p>
                  点开任意一篇，可以看到完整的章节展开。
                </p>
              </div>
            )}
          </section>

          {/* Tab 切换 */}
          <div className="mt-16 flex items-center gap-2 border-b border-white/10 reveal">
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              const count = notes.filter((n) => n.type === tab.key).length;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-5 md:px-7 py-4 text-sm md:text-base tracking-widest uppercase transition-colors ${
                    active
                      ? 'text-white'
                      : 'text-white/45 hover:text-white/80'
                  }`}
                >
                  <span className="font-semibold">{tab.label}</span>
                  <span className="ml-2 text-xs tracking-normal text-white/40 tabular-nums">
                    {count}
                  </span>
                  {/* 下划线指示器 */}
                  <span
                    className={`absolute left-0 right-0 -bottom-px h-px transition-all duration-500 ${
                      active ? 'bg-white' : 'bg-transparent'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* 笔记列表（时间线） */}
          <ul
            key={activeTab}
            className="mt-16 relative border-l border-white/15 pl-8 md:pl-12 space-y-16"
          >
            {visibleNotes.map((note, idx) => (
              <li
                key={note.id}
                className={`relative reveal reveal-delay-${Math.min((idx % 3) + 1, 3)}`}
              >
                {/* 节点 */}
                <span className="absolute -left-[42px] md:-left-[54px] top-2 w-3 h-3 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.6)]" />

                {/* 元信息：日期 · 分类 · (essay) 阅读时长 */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs tracking-[0.35em] uppercase text-white/40 mb-3 tabular-nums">
                  <span>{note.date}</span>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <span>{note.category}</span>
                  {note.readingTime && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-white/30" />
                      <span>{note.readingTime}</span>
                    </>
                  )}
                </div>

                {note.type === 'essay' ? (
                  // ============ 知识：整张卡片可点击跳详情 ============
                  <Link
                    href={`/notes/${note.id}`}
                    className="group block max-w-2xl border border-white/10 bg-white/[0.02] hover:border-white/40 hover:bg-white/[0.05] p-6 md:p-8 transition-all duration-500"
                  >
                    {note.title && (
                      <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4 group-hover:text-white">
                        {note.title}
                      </h2>
                    )}

                    <div className="space-y-3 text-white/70 text-base md:text-lg leading-[1.9] mb-6">
                      {note.body.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>

                    {/* 章节预览 */}
                    {note.sections && note.sections.length > 0 && (
                      <ol className="space-y-2 text-sm md:text-base text-white/55 tabular-nums mb-6">
                        {note.sections.slice(0, 4).map((s, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="text-white/30 w-6 shrink-0">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <span>{s.heading}</span>
                          </li>
                        ))}
                        {note.sections.length > 4 && (
                          <li className="text-white/35 pl-9">
                            … 共 {note.sections.length} 节
                          </li>
                        )}
                      </ol>
                    )}

                    <div className="flex items-center justify-between text-xs tracking-[0.3em] uppercase text-white/40 group-hover:text-white transition-colors">
                      <span>阅读全文</span>
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </Link>
                ) : (
                  // ============ 碎碎念：摘要卡片，点击进详情 ============
                  <Link
                    href={`/notes/${note.id}`}
                    className="group block max-w-2xl"
                  >
                    {note.title && (
                      <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4 group-hover:opacity-80 transition-opacity">
                        {note.title}
                      </h2>
                    )}
                    <div className="space-y-4 text-white/75 text-base md:text-lg leading-[1.9]">
                      {note.body.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                    <div className="mt-5 flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-white/40 group-hover:text-white transition-colors">
                      <span>展开 / 评论</span>
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </Link>
                )}
              </li>
            ))}

            {visibleNotes.length === 0 && (
              <li className="text-white/45 text-base">这一类还在路上，敬请期待。</li>
            )}
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
