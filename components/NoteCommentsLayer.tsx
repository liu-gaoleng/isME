'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  createComment,
  fetchComments,
  isSupabaseConfigured,
  type NoteComment,
} from '@/lib/comments';

interface Props {
  /** 当前文章 id（对应 lib/notes.ts 里的 note.id） */
  noteId: string;
  /** 文章正文容器：评论的选中只在此容器内有效 */
  contentRef: React.RefObject<HTMLElement | null>;
}

interface BubblePos {
  /** 相对于 viewport 的位置（fixed） */
  top: number;
  left: number;
}

interface DraftQuote {
  text: string;
  pos: BubblePos;
}

const NICKNAME_KEY = 'liu_notes_nickname';

/** 把扁平评论列表组织成 thread tree（一层回复） */
function buildThreads(list: NoteComment[]): {
  top: NoteComment[];
  childrenOf: Map<string, NoteComment[]>;
} {
  const top: NoteComment[] = [];
  const childrenOf = new Map<string, NoteComment[]>();
  for (const c of list) {
    if (c.parent_id) {
      const arr = childrenOf.get(c.parent_id) ?? [];
      arr.push(c);
      childrenOf.set(c.parent_id, arr);
    } else {
      top.push(c);
    }
  }
  return { top, childrenOf };
}

/** 把 quote_text 转成稳定的 key，用于在文章正文里检索并加下划线 */
function quoteKey(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

/** 在文章 DOM 内为所有被引用过的文字加下划线（同步修改 DOM） */
function applyHighlights(
  root: HTMLElement,
  quotes: { quote: string; topId: string }[]
) {
  // 先清空旧的高亮
  root.querySelectorAll('mark[data-quote-id]').forEach((el) => {
    const parent = el.parentNode!;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
    parent.normalize();
  });

  if (quotes.length === 0) return;

  // 按长度倒序，避免短串先匹配到长串内部
  const sorted = [...quotes].sort((a, b) => b.quote.length - a.quote.length);

  for (const { quote, topId } of sorted) {
    if (!quote || quote.length < 2) continue;
    walkAndWrap(root, quote, topId);
  }
}

function walkAndWrap(root: HTMLElement, needle: string, topId: string) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      // 跳过已经被包裹过的、或在 mark 内的
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest('mark[data-quote-id]')) return NodeFilter.FILTER_REJECT;
      if (parent.closest('[data-comment-skip]')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const targets: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) targets.push(n as Text);

  for (const text of targets) {
    let str = text.nodeValue ?? '';
    let idx = str.indexOf(needle);
    if (idx === -1) continue;
    // 只为第一个匹配做高亮，避免大量同串污染
    const before = str.slice(0, idx);
    const matched = str.slice(idx, idx + needle.length);
    const after = str.slice(idx + needle.length);

    const frag = document.createDocumentFragment();
    if (before) frag.appendChild(document.createTextNode(before));
    const mark = document.createElement('mark');
    mark.setAttribute('data-quote-id', topId);
    mark.className =
      'bg-transparent text-inherit underline decoration-white/40 decoration-2 underline-offset-4 cursor-pointer hover:decoration-white transition-colors';
    mark.appendChild(document.createTextNode(matched));
    frag.appendChild(mark);
    if (after) frag.appendChild(document.createTextNode(after));

    text.parentNode!.replaceChild(frag, text);
  }
}

export default function NoteCommentsLayer({ noteId, contentRef }: Props) {
  const [comments, setComments] = useState<NoteComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<DraftQuote | null>(null);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [composeQuote, setComposeQuote] = useState<string | null>(null);
  const [composeBody, setComposeBody] = useState('');
  const [composeName, setComposeName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<NoteComment | null>(null);
  const [highlightTopId, setHighlightTopId] = useState<string | null>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const composeRef = useRef<HTMLTextAreaElement>(null);

  const configured = isSupabaseConfigured();

  // 初始化昵称
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NICKNAME_KEY);
      if (saved) setComposeName(saved);
    } catch {}
  }, []);

  // 拉取评论
  useEffect(() => {
    let cancel = false;
    setLoading(true);
    fetchComments(noteId).then((list) => {
      if (!cancel) {
        setComments(list);
        setLoading(false);
      }
    });
    return () => {
      cancel = true;
    };
  }, [noteId]);

  const { top, childrenOf } = useMemo(() => buildThreads(comments), [comments]);

  /** 顶层评论里出现过的引用文字 -> topId */
  const quoteMap = useMemo(() => {
    const list: { quote: string; topId: string }[] = [];
    for (const c of top) {
      if (c.quote_text) {
        list.push({ quote: quoteKey(c.quote_text), topId: c.id });
      }
    }
    return list;
  }, [top]);

  // 渲染下划线高亮
  useEffect(() => {
    if (!contentRef.current) return;
    applyHighlights(contentRef.current, quoteMap);
  }, [quoteMap, contentRef]);

  // 处理选区 -> 显示气泡
  useEffect(() => {
    function onSelectionChange() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setDraft(null);
        return;
      }
      const range = sel.getRangeAt(0);
      const container = contentRef.current;
      if (!container) {
        setDraft(null);
        return;
      }
      // 选区必须完全位于正文容器之内
      const ancestor = range.commonAncestorContainer;
      if (!container.contains(ancestor)) {
        setDraft(null);
        return;
      }
      const text = sel.toString().trim();
      if (text.length < 2 || text.length > 280) {
        setDraft(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      if (!rect || rect.width === 0) {
        setDraft(null);
        return;
      }
      setDraft({
        text,
        pos: {
          top: rect.top - 44,
          left: rect.left + rect.width / 2,
        },
      });
    }
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, [contentRef]);

  // 点击下划线 -> 滚动到对应评论
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    function onClick(e: Event) {
      const t = e.target as HTMLElement;
      const mark = t.closest('mark[data-quote-id]') as HTMLElement | null;
      if (!mark) return;
      const id = mark.getAttribute('data-quote-id');
      if (!id) return;
      setOpenSidebar(true);
      setHighlightTopId(id);
      // 等侧边栏挂载后滚动
      requestAnimationFrame(() => {
        const el = document.getElementById(`comment-${id}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
    container.addEventListener('click', onClick);
    return () => container.removeEventListener('click', onClick);
  }, [contentRef]);

  const startCompose = useCallback((quote: string | null) => {
    setComposeQuote(quote);
    setReplyTo(null);
    setOpenSidebar(true);
    setDraft(null);
    // 清掉 selection
    window.getSelection()?.removeAllRanges();
    requestAnimationFrame(() => {
      composeRef.current?.focus();
    });
  }, []);

  const startReply = useCallback((c: NoteComment) => {
    setReplyTo(c);
    setComposeQuote(null);
    setOpenSidebar(true);
    requestAnimationFrame(() => {
      composeRef.current?.focus();
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!composeBody.trim() || !composeName.trim()) return;
    if (!configured) {
      alert('评论服务未配置，请稍后再试。');
      return;
    }
    setSubmitting(true);
    try {
      const created = await createComment({
        note_id: noteId,
        parent_id: replyTo?.id ?? null,
        // 回复时不带新引用；只有顶层评论有 quote
        quote_text: replyTo ? null : composeQuote,
        body: composeBody,
        author_name: composeName,
      });
      try {
        localStorage.setItem(NICKNAME_KEY, composeName.trim());
      } catch {}
      setComments((prev) => [...prev, created]);
      setComposeBody('');
      setReplyTo(null);
      setComposeQuote(null);
      // 高亮新建的顶层评论
      if (!created.parent_id) setHighlightTopId(created.id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '提交失败';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  }, [composeBody, composeName, composeQuote, configured, noteId, replyTo]);

  const totalCount = comments.length;

  return (
    <>
      {/* 选区气泡：黑底胶囊 + 引号图标 + hover 升起 */}
      {draft && (
        <div
          className="fixed z-50 -translate-x-1/2 -translate-y-1 pointer-events-none"
          style={{ top: draft.pos.top, left: draft.pos.left }}
          data-comment-skip
        >
          <button
            type="button"
            onMouseDown={(e) => {
              // 防止 mousedown 让 selection 立刻消失
              e.preventDefault();
            }}
            onClick={() => startCompose(draft.text)}
            className="comment-bubble pointer-events-auto group inline-flex items-center gap-2 pl-3 pr-3.5 py-2 rounded-full bg-black text-white text-xs font-medium tracking-wide ring-1 ring-white/15 shadow-[0_10px_28px_rgba(0,0,0,0.55)] backdrop-blur-md hover:ring-white/40 hover:shadow-[0_14px_36px_rgba(0,0,0,0.7)] transition-all duration-200"
            aria-label="对选中内容评论"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 text-white/85 group-hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <span>评论</span>
            <span
              aria-hidden
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-black ring-1 ring-white/15"
              style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }}
            />
          </button>
        </div>
      )}

      {/* 触发按钮（右下角悬浮）：黑底胶囊 + 图标 + 角标 */}
      <button
        type="button"
        onClick={() => setOpenSidebar((v) => !v)}
        className="fixed bottom-8 right-8 z-40 group inline-flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-black text-white text-sm font-medium tracking-wide ring-1 ring-white/15 shadow-[0_14px_32px_rgba(0,0,0,0.55)] backdrop-blur-md hover:ring-white/40 hover:shadow-[0_18px_40px_rgba(0,0,0,0.75)] hover:-translate-y-0.5 transition-all duration-300"
        data-comment-skip
        aria-label={`评论 ${totalCount} 条`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 text-white/85 group-hover:text-white transition-colors"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        <span>评论</span>
        {totalCount > 0 && (
          <span className="ml-1 inline-flex min-w-[1.4rem] h-5 px-1.5 items-center justify-center rounded-full bg-white text-black text-[11px] font-semibold tabular-nums">
            {totalCount}
          </span>
        )}
      </button>

      {/* 评论侧边栏（顶部错开 fixed navbar，避免被遮挡） */}
      <div
        ref={sidebarRef}
        className={`fixed right-0 z-40 w-full sm:w-[420px] bg-black border-l border-white/10 transition-transform duration-500 flex flex-col top-20 md:top-24 h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] ${
          openSidebar ? 'translate-x-0' : 'translate-x-full'
        }`}
        data-comment-skip
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="text-xs tracking-[0.3em] uppercase text-white/55">
            评论 <span className="text-white/35 ml-1 tabular-nums">{totalCount}</span>
          </div>
          <button
            type="button"
            onClick={() => setOpenSidebar(false)}
            className="text-white/55 hover:text-white text-xl leading-none"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {!configured && (
            <p className="text-xs text-white/45 leading-relaxed">
              评论服务尚未配置（缺少 Supabase 环境变量）。请按
              <code className="mx-1 px-1 py-0.5 bg-white/10 text-white/70">supabase/schema.sql</code>
              建表，并在 <code className="mx-1 px-1 py-0.5 bg-white/10 text-white/70">.env.local</code>
              填入 URL / anon key 后重启。
            </p>
          )}
          {loading && (
            <p className="text-sm text-white/45">加载中…</p>
          )}
          {!loading && top.length === 0 && (
            <p className="text-sm text-white/45 leading-relaxed">
              选中文章里的任意一段文字，点击浮出的「+ 评论」即可留下你的批注。
            </p>
          )}
          {top.map((c) => {
            const replies = childrenOf.get(c.id) ?? [];
            const active = highlightTopId === c.id;
            return (
              <div
                key={c.id}
                id={`comment-${c.id}`}
                className={`scroll-mt-24 ${active ? 'ring-1 ring-white/40 -mx-3 px-3 py-3' : ''}`}
              >
                {c.quote_text && (
                  <div className="mb-2 border-l-2 border-white/35 pl-3 text-xs text-white/55 italic line-clamp-3">
                    “{c.quote_text}”
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-white">{c.author_name}</span>
                  <span className="text-[10px] tracking-widest uppercase text-white/35 tabular-nums">
                    {formatTime(c.created_at)}
                  </span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                  {c.body}
                </p>
                <button
                  type="button"
                  onClick={() => startReply(c)}
                  className="mt-2 text-xs tracking-widest uppercase text-white/45 hover:text-white"
                >
                  回复
                </button>

                {/* 回复列表 */}
                {replies.length > 0 && (
                  <div className="mt-4 pl-4 border-l border-white/15 space-y-4">
                    {replies.map((r) => (
                      <div key={r.id}>
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">
                            {r.author_name}
                          </span>
                          <span className="text-[10px] tracking-widest uppercase text-white/35 tabular-nums">
                            {formatTime(r.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap">
                          {r.body}
                        </p>
                        <button
                          type="button"
                          onClick={() => startReply(c)}
                          className="mt-1.5 text-xs tracking-widest uppercase text-white/35 hover:text-white"
                        >
                          回复
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 输入区 */}
        <div className="border-t border-white/10 p-5 bg-black">
          {(composeQuote || replyTo) && (
            <div className="mb-3 flex items-start justify-between gap-2 border-l-2 border-white/35 pl-3 py-1">
              <div className="text-xs text-white/60 italic line-clamp-2">
                {replyTo ? `回复 @${replyTo.author_name}：${replyTo.body}` : `“${composeQuote}”`}
              </div>
              <button
                type="button"
                onClick={() => {
                  setComposeQuote(null);
                  setReplyTo(null);
                }}
                className="text-white/40 hover:text-white text-sm leading-none shrink-0"
                aria-label="取消"
              >
                ×
              </button>
            </div>
          )}
          <input
            type="text"
            placeholder="昵称"
            value={composeName}
            onChange={(e) => setComposeName(e.target.value.slice(0, 40))}
            className="w-full mb-2 px-3 py-2 bg-white/5 border border-white/15 text-sm text-white placeholder-white/35 focus:outline-none focus:border-white/40"
          />
          <textarea
            ref={composeRef}
            placeholder={
              replyTo
                ? '写下你的回复…'
                : composeQuote
                  ? '聊聊你对这段话的看法…'
                  : '在文中选择一段文字，再来这里评论；或者直接留言。'
            }
            value={composeBody}
            onChange={(e) => setComposeBody(e.target.value.slice(0, 4000))}
            rows={3}
            className="w-full px-3 py-2 bg-white/5 border border-white/15 text-sm text-white placeholder-white/35 focus:outline-none focus:border-white/40 resize-none"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] tracking-widest uppercase text-white/35">
              {composeBody.length}/4000
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                submitting ||
                !configured ||
                composeBody.trim().length === 0 ||
                composeName.trim().length === 0
              }
              className="px-4 py-2 bg-white text-black text-xs tracking-widest uppercase font-semibold disabled:bg-white/20 disabled:text-white/45"
            >
              {submitting ? '提交中…' : '发布'}
            </button>
          </div>
        </div>
      </div>

      {/* 遮罩 */}
      {openSidebar && (
        <button
          type="button"
          aria-label="关闭评论"
          onClick={() => setOpenSidebar(false)}
          className="fixed inset-0 z-30 bg-black/40 sm:hidden"
          data-comment-skip
        />
      )}
    </>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} ${hh}:${mm}`;
}
