'use client';

import { useRef } from 'react';
import Link from 'next/link';
import NoteCommentsLayer from '@/components/NoteCommentsLayer';
import type { Note } from '@/lib/notes';

interface Props {
  note: Note;
}

/** 给章节标题生成稳定的锚点 id */
function sectionAnchor(idx: number) {
  return `s-${idx + 1}`;
}

/**
 * 笔记详情页正文 + 评论交互层。
 * 服务端 page.tsx 会传入对应 note，并由本组件渲染 essay / musing 两种形态。
 */
export default function NoteContent({ note }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const isEssay = note.type === 'essay';

  return (
    <>
      <article className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
        {/* 返回 */}
        <Link
          href="/notes"
          className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-white/45 hover:text-white transition-colors mb-10"
          data-comment-skip
        >
          <span>←</span>
          <span>返回笔记</span>
        </Link>

        {/* 标题区 */}
        <header className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs tracking-[0.35em] uppercase text-white/40 mb-6 tabular-nums">
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
          {note.title && (
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
              {note.title}
            </h1>
          )}
        </header>

        {/* essay：引言 + 侧边目录 + 章节正文； musing：直接铺正文 */}
        {isEssay ? (
          <>
            {/* 引言 */}
            <div
              ref={contentRef as React.RefObject<HTMLDivElement>}
              className="max-w-3xl"
            >
              <div className="mt-10 space-y-5 text-white/75 text-lg leading-[1.9] border-l-2 border-white/30 pl-6">
                {note.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {/* 正文 + 侧边目录 */}
              <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-none">
                {/* 侧边目录 */}
                {note.sections && note.sections.length > 0 && (
                  <aside
                    className="hidden lg:block lg:col-span-3"
                    data-comment-skip
                  >
                    <div className="sticky top-32">
                      <div className="text-[11px] tracking-[0.35em] uppercase text-white/40 mb-4">
                        目录
                      </div>
                      <ol className="space-y-3 text-sm text-white/55 tabular-nums">
                        {note.sections.map((s, i) => (
                          <li key={i}>
                            <a
                              href={`#${sectionAnchor(i)}`}
                              className="flex gap-3 hover:text-white transition-colors"
                            >
                              <span className="text-white/30 w-6 shrink-0">
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <span className="flex-1 leading-relaxed">
                                {s.heading}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </aside>
                )}

                {/* 正文 */}
                <div className="lg:col-span-9">
                  {/* 移动端目录 */}
                  {note.sections && note.sections.length > 0 && (
                    <details
                      className="lg:hidden mb-12 border border-white/10 bg-white/[0.02] p-5"
                      data-comment-skip
                    >
                      <summary className="cursor-pointer text-[11px] tracking-[0.35em] uppercase text-white/55 hover:text-white">
                        目录（{note.sections.length} 节）
                      </summary>
                      <ol className="mt-4 space-y-2 text-sm text-white/65 tabular-nums">
                        {note.sections.map((s, i) => (
                          <li key={i}>
                            <a
                              href={`#${sectionAnchor(i)}`}
                              className="flex gap-3 hover:text-white"
                            >
                              <span className="text-white/35 w-6 shrink-0">
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <span>{s.heading}</span>
                            </a>
                          </li>
                        ))}
                      </ol>
                    </details>
                  )}

                  {/* 章节正文 */}
                  <div className="space-y-20 max-w-2xl">
                    {note.sections?.map((s, i) => (
                      <section
                        key={i}
                        id={sectionAnchor(i)}
                        className="scroll-mt-32"
                      >
                        <div className="text-xs tracking-[0.4em] uppercase text-white/40 mb-3 tabular-nums">
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-6 leading-snug">
                          {s.heading}
                        </h2>
                        <div className="space-y-5 text-white/75 text-base md:text-lg leading-[1.95]">
                          {s.paragraphs.map((p, pi) => (
                            <p key={pi}>{p}</p>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>

                  {/* 文末 */}
                  <div
                    className="mt-24 pt-10 border-t border-white/10 max-w-2xl flex items-center justify-between text-sm"
                    data-comment-skip
                  >
                    <span className="text-white/45">—— 完 ——</span>
                    <Link
                      href="/notes"
                      className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-white/55 hover:text-white transition-colors"
                    >
                      <span>←</span>
                      <span>返回笔记</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ============ Musing：单栏长读模式 ============ */
          <div
            ref={contentRef as React.RefObject<HTMLDivElement>}
            className="max-w-2xl"
          >
            <div className="mt-12 space-y-6 text-white/80 text-lg md:text-xl leading-[1.95]">
              {note.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* 文末 */}
            <div
              className="mt-24 pt-10 border-t border-white/10 flex items-center justify-between text-sm"
              data-comment-skip
            >
              <span className="text-white/45">—— 完 ——</span>
              <Link
                href="/notes"
                className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-white/55 hover:text-white transition-colors"
              >
                <span>←</span>
                <span>返回笔记</span>
              </Link>
            </div>
          </div>
        )}
      </article>

      {/* 评论交互层：选区气泡 / 侧边栏 / 下划线 */}
      <NoteCommentsLayer noteId={note.id} contentRef={contentRef} />
    </>
  );
}
