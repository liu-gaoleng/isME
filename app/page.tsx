'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import { Article } from '@/lib/api';
import { useScrollReveal } from '@/lib/useScrollReveal';

/* ============================================================
 * Weekly Pick · 每周精选数据
 * ----------------------------------------------------------------
 * 每周日花 30 分钟更新一次：
 *   1. 改 weekLabel 为新一周编号（YYYY.WW），例如 '2026.W22'
 *   2. 替换 items 数组里的 4-6 条新内容
 * 字段说明：
 *   - type: 'article' | 'video' | 'tweet' | 'paper'  内容形态
 *   - topic: 自由标签 e.g. 'AI', 'Markets', 'Tech', 'Finance'
 *   - title: 内容主标题
 *   - source: 来源（媒体名 / 频道 / 作者）
 *   - url: 原文外链（点击在新标签页打开）
 *   - note: 你的一句点评（可选，但强烈建议保留——这是你站点的灵魂）
 * ========================================================== */

type PickType = 'article' | 'video' | 'tweet' | 'paper';

interface WeeklyPickItem {
  type: PickType;
  topic: string;
  title: string;
  source: string;
  url: string;
  note?: string;
}

const PICK_META: Record<PickType, { label: string; dot: string }> = {
  article: { label: 'Article', dot: 'bg-white/70' },
  video:   { label: 'Video',   dot: 'bg-red-400/80' },
  tweet:   { label: 'Tweet',   dot: 'bg-sky-400/80' },
  paper:   { label: 'Paper',   dot: 'bg-emerald-400/80' },
};

const weeklyPicks: { weekLabel: string; items: WeeklyPickItem[] } = {
  weekLabel: '2026.W22',
  items: [
    {
      type: 'article',
      topic: 'AI',
      title: 'The Bitter Lesson, Revisited',
      source: 'Rich Sutton · incompleteideas.net',
      url: 'http://www.incompleteideas.net/IncIdeas/BitterLesson.html',
      note: '十年后再读，依然刺痛——通用方法 + 算力终将胜过精巧人工设计。',
    },
    {
      type: 'video',
      topic: 'Tech',
      title: 'A Conversation with Jensen Huang',
      source: 'Acquired Podcast · YouTube',
      url: 'https://www.youtube.com/results?search_query=jensen+huang+acquired+podcast',
      note: '黄仁勋讲述他二十年前选择押注加速计算时的孤独——伟大的判断常诞生在共识之外。',
    },
    {
      type: 'tweet',
      topic: 'Markets',
      title: '"市场不会奖励正确，市场只奖励先于共识的正确。"',
      source: '@morganhousel',
      url: 'https://twitter.com/morganhousel',
      note: '一句话击穿了"我看对了为什么没赚到钱"这件事的本质。',
    },
    {
      type: 'paper',
      topic: 'AI',
      title: 'Scaling Laws for Neural Language Models',
      source: 'Kaplan et al., 2020 · arXiv:2001.08361',
      url: 'https://arxiv.org/abs/2001.08361',
      note: '当下 AI 工业化的"地基论文"，理解为什么"更大就是更好"在过去五年成为信仰。',
    },
    {
      type: 'article',
      topic: 'Finance',
      title: 'Why Compounding Is Magic',
      source: 'Morgan Housel · Collaborative Fund',
      url: 'https://collabfund.com/blog/',
      note: '不是高收益，而是时间——这是金融里最被低估也最被知道的真相。',
    },
    {
      type: 'video',
      topic: 'AI',
      title: '"Software is eating the world. AI is eating software."',
      source: 'Andrej Karpathy · YouTube Talks',
      url: 'https://www.youtube.com/@AndrejKarpathy',
      note: 'Karpathy 总能用最朴素的语言讲清楚最深的事——这是最好的工程师品质。',
    },
  ],
};

export default function Home() {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // 启用滚动揭示动画
  useScrollReveal();

  // 顶部进度条
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setScrollProgress(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const featured = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/articles/featured`
        ).then((r) => r.json());

        setFeaturedArticles(featured.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* 顶部滚动进度条 */}
      <div
        className="fixed top-0 left-0 right-0 h-[2px] bg-white/80 z-[60] origin-left"
        style={{
          transform: `scaleX(${scrollProgress / 100})`,
          transition: 'transform 0.15s ease-out',
        }}
      />

      <Navbar transparent />

      <main className="flex-grow">
        {/* Hero Section - 全屏视频背景 */}
        <section className="relative w-full h-screen overflow-hidden">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/videos/hero-poster.jpg"
            aria-hidden="true"
          >
            <source src="/videos/hero-bg.mp4" type="video/mp4" />
            您的浏览器不支持 video 标签
          </video>

          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />

          <div className="relative z-10 h-full flex flex-col items-start justify-center px-6 sm:px-10 lg:px-14 max-w-7xl mx-auto w-full text-white">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-8 reveal">
              Hello,
              <br />
              I&apos;m <span className="italic font-light">LiuWenhao</span>.
            </h1>
            <p className="max-w-xl text-base md:text-lg text-white/70 leading-relaxed mb-6 reveal reveal-delay-1">
              灵感本易逝，行动应当是。
            </p>
            <p className="max-w-2xl text-sm md:text-base text-white/55 leading-[1.9] reveal reveal-delay-2">
              一个疯子，<span className="text-white/80">写代码，也写文字</span>，
              梦想是当 <span className="text-white/80">21 世纪的 Elon Musk 或 Jensen Huang</span>。
              <br className="hidden md:block" />
              这里收藏了我的<span className="text-white/80">产品、笔记、爱好与经历</span>，
              欢迎随意走走。
            </p>
          </div>

          {/* 底部滚动提示 */}
          <a
            href="#manifesto"
            aria-label="向下滚动"
            className="group absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-white/60 hover:text-white flex flex-col items-center gap-3 transition-colors"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-bounce"
            >
              <path d="M12 5v14" />
              <path d="M6 13l6 6 6-6" />
            </svg>
            <span className="block w-px h-10 bg-white/40 animate-pulse" />
          </a>
        </section>

        {/* Manifesto / 引言 */}
        <section id="manifesto" className="relative bg-black py-32 md:py-44 border-t border-white/10 overflow-hidden">
          <span className="chapter-bg top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
            MANIFESTO
          </span>
          <div className="relative max-w-5xl mx-auto px-6 sm:px-10 lg:px-14">
            <p className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight reveal">
              我相信代码与文字
              <br />
              都能成为
              <span className="italic font-light text-white/80"> 改变世界 </span>
              的杠杆。
            </p>
            <p className="mt-8 max-w-2xl text-base md:text-lg text-white/60 leading-relaxed reveal reveal-delay-1">
              当然，21 岁时最大的杠杆一定是投资自己——重点在提升自己的技术能力、创造能力、商业能力、产品能力、网络与信誉。
            </p>
          </div>
        </section>

        {/* PAST / 过去 */}
        <section
          id="past"
          className="relative bg-black py-28 md:py-36 border-t border-white/10 overflow-hidden"
        >
          <span className="chapter-bg top-10 -left-10 select-none">PAST</span>
          <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4 reveal">
                <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                  过去
                </h2>

                {/* 过去的剪影 · 深夜里的代码 */}
                <figure className="mt-8 md:mt-10">
                  <div className="relative overflow-hidden border border-white/10 bg-white/[0.02]">
                    <img
                      src="/material/past/69f0ddaa23dfdf101591a7eef9da41a8.jpg"
                      alt="深夜里的代码"
                      className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <figcaption className="mt-3 text-[11px] tracking-[0.35em] uppercase text-white/40">
                    深夜里的代码
                  </figcaption>
                </figure>
              </div>
              <div className="lg:col-span-8">
                <ul className="relative border-l border-white/15 pl-8 md:pl-12 space-y-12">
                  {[
                    {
                      year: '童年',
                      title: '与好奇心相遇',
                      desc: '小时候和二哥用大头电脑打 LOL，到大学计算机课输出第一行「Hello World！」。',
                    },
                    {
                      year: '学生时代',
                      title: '从兴趣到方法',
                      desc: '没有兴趣，只有高考时选了对应专业后的妥协；当拼命一年来到大数据领域最顶尖的公司之一工作时，才发现，兴趣是多么重要。',
                    },
                    {
                      year: '初入职场',
                      title: '面对真实的世界',
                      desc: '第一次看见自己写下的代码被 DS 使用 从而影响商业化整体的决策时，那种敬畏感至今犹在；但我绝不会满足于此，更不会一辈子锁死在小小的工位上。',
                    },
                  ].map((item, idx) => (
                    <li
                      key={item.title}
                      className={`relative reveal reveal-delay-${Math.min(idx + 1, 3)}`}
                    >
                      <span className="absolute -left-[42px] md:-left-[54px] top-2 w-3 h-3 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.6)]" />
                      <div className="text-xs tracking-[0.35em] uppercase text-white/40 mb-2">
                        {item.year}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                        {item.title}
                      </h3>
                      <p className="text-white/65 leading-relaxed text-base md:text-lg max-w-2xl">
                        {item.desc}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* PRESENT / 现在 */}
        <section
          id="present"
          className="relative bg-black py-28 md:py-36 border-t border-white/10 overflow-hidden"
        >
          <span className="chapter-bg top-8 right-0 select-none">NOW</span>
          <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-12 reveal">
              现在
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: '工程实践',
                  desc: '在 Web 开发、大数据开发、小游戏开发等领域都有涉及，当然最熟练的一定是 vibe coding。',
                },
                {
                  title: '持续学习',
                  desc: '每天读、每天写、每天想我到底要做什么。尽量让自己身处于行业的最前沿，学习 AI，找到兴趣、大量阅读、保持健康、坚持输出、稳定复利。',
                },
                {
                  title: '记录与分享',
                  desc: '在这个网站记下产品与思考，掌握知识的最好体现就是可以很好地教给他人。',
                },
              ].map((item, idx) => (
                <div
                  key={item.title}
                  className={`group relative border border-white/10 p-8 md:p-10 hover:border-white/40 hover:bg-white/[0.04] transition-all duration-500 reveal reveal-delay-${Math.min(idx + 1, 3)}`}
                >
                  <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-white/60 leading-relaxed">{item.desc}</p>
                  <div className="mt-8 h-px w-12 bg-white/30 group-hover:w-24 transition-all duration-500" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FUTURE / 将来 */}
        <section
          id="future"
          className="relative bg-black py-28 md:py-36 border-t border-white/10 overflow-hidden"
        >
          <span className="chapter-bg top-12 left-1/4 select-none">FUTURE</span>
          <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-14 reveal">
              将来
            </h2>

            <blockquote className="reveal reveal-delay-1">
              <p className="text-3xl md:text-5xl font-extrabold leading-[1.2] tracking-tight">
                <span className="text-white/40">「</span>
                我不甘愿做大厂里的一颗螺丝钉——
                我想打造一款属于自己的产品。
                <span className="text-white/40">」</span>
              </p>
              <footer className="mt-6 text-xs tracking-[0.4em] uppercase text-white/50">
                —— 写给未来的自己
              </footer>
            </blockquote>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: '不做螺丝钉',
                  desc: '工位上的稳定与体面，是这个时代最隐蔽的陷阱。我尊重每一份工作，但我拒绝把一辈子折叠进一个 Title。',
                },
                {
                  title: '造自己的东西',
                  desc: '从一行代码、一个产品，到一家公司——像 Elon、像 Jensen 那样，把疯狂的想法一步步变成现实。',
                },
                {
                  title: '改变行业的规则',
                  desc: '真正值得做的事，是别人没做过、或者不敢做的事。技术、AI、能源、商业——总有一条路属于这一代人。',
                },
                {
                  title: '走到世界中央',
                  desc: '把眼界从工位扩展到全球，与最聪明、最敢想的人同行；让我做出来的东西，能被这个世界听见、用上、记住。',
                },
              ].map((item, idx) => (
                <div
                  key={item.title}
                  className={`border-l-2 border-white/30 pl-6 md:pl-8 py-2 reveal reveal-delay-${Math.min(idx + 1, 3)}`}
                >
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* 将来的两幅画 */}
            <div className="mt-20 md:mt-24 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {[
                {
                  src: '/material/future/bc7bcc999d5e41b6a36e2c6ca195f84f.jpg',
                  caption: '梦想 · 朝着远方走',
                },
                {
                  src: '/material/future/0a0af4264bb7caa88d4673fbc7f2b759.jpg',
                  caption: '行动 · 不肯停下的人',
                },
              ].map((img, idx) => (
                <figure
                  key={img.src}
                  className={`reveal reveal-delay-${Math.min(idx + 1, 3)}`}
                >
                  <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] aspect-[4/3]">
                    <img
                      src={img.src}
                      alt={img.caption}
                      className="w-full h-full object-cover opacity-90 hover:opacity-100 hover:scale-[1.02] transition-all duration-700"
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <figcaption className="mt-3 text-[11px] tracking-[0.35em] uppercase text-white/40">
                    {img.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* AMBITION / 雄心 */}
        <section
          id="ambition"
          className="relative bg-black py-32 md:py-48 border-t border-white/10 overflow-hidden"
        >
          <span className="chapter-bg bottom-0 left-1/2 -translate-x-1/2 select-none">
            AMBITION
          </span>
          <div className="relative max-w-5xl mx-auto px-6 sm:px-10 lg:px-14 text-center">
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tight leading-[0.95] reveal">
              改变
              <br />
              <span className="italic font-light text-white/85">世界</span>。
            </h2>
            <p className="mt-12 max-w-2xl mx-auto text-base md:text-lg text-white/65 leading-relaxed reveal reveal-delay-1">
              这不是一句口号。它是每个清晨我推开门时的提醒——
              <br className="hidden md:block" />
              你可以更勇敢一点、更慷慨一点、更有耐心一点。
              <br className="hidden md:block" />
              世界也许不会因为某一行代码骤然改变，但它一定会因为
              <span className="text-white"> 不肯停下的人 </span>
              而慢慢不同。
            </p>

            <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center reveal reveal-delay-2">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center px-10 py-4 border border-white/40 text-white text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all"
              >
                查看产品
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-10 py-4 bg-white text-black text-sm tracking-widest uppercase hover:bg-white/85 transition-all"
              >
                与我同行
              </Link>
            </div>
          </div>
        </section>

        {/* Works / 产品 */}
        <section id="works" className="bg-black py-24 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
            <div className="flex justify-between items-end mb-12 reveal">
              <h2 className="text-4xl md:text-5xl font-bold text-white">产品</h2>
              <Link
                href="/blog"
                className="hidden md:inline-block text-sm tracking-widest uppercase text-white/70 hover:text-white border-b border-white/30 hover:border-white pb-1 transition-colors"
              >
                查看全部 →
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12 text-white/60">加载中...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-400">{error}</div>
            ) : featuredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredArticles.slice(0, 6).map((article, idx) => (
                  <div key={article.id} className={`reveal reveal-delay-${Math.min(idx % 3 + 1, 3)}`}>
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/50">暂无产品</div>
            )}
          </div>
        </section>

        {/* Hot — Weekly Pick / 每周精选 */}
        <section id="popular" className="bg-black py-24 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
            <div className="mb-12 reveal flex items-end justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-white">每周精选</h2>
                <div className="mt-3 text-sm tracking-widest uppercase text-white/40">
                  本周值得停下来读 · 每周一更新
                </div>
              </div>
              <div className="text-xs tracking-[0.35em] uppercase text-white/40 tabular-nums">
                Week · {weeklyPicks.weekLabel}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {weeklyPicks.items.map((item, idx) => {
                const meta = PICK_META[item.type];
                return (
                  <a
                    key={item.url}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative flex flex-col border border-white/10 bg-white/[0.02] p-6 md:p-7 hover:border-white/40 hover:bg-white/[0.05] transition-all duration-500 reveal reveal-delay-${Math.min((idx % 3) + 1, 3)}`}
                  >
                    {/* 类型 + 领域标签 */}
                    <div className="flex items-center justify-between mb-5">
                      <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-white/60">
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                      <span className="text-[11px] tracking-[0.3em] uppercase text-white/40">
                        {item.topic}
                      </span>
                    </div>

                    {/* 标题 */}
                    <h3 className="text-lg md:text-xl font-semibold text-white leading-snug mb-3 group-hover:text-white">
                      {item.title}
                    </h3>

                    {/* 来源 / 作者 */}
                    <div className="text-xs tracking-widest uppercase text-white/40 mb-4">
                      {item.source}
                    </div>

                    {/* Liu 的点评 */}
                    {item.note && (
                      <p className="text-sm text-white/65 leading-[1.8] flex-grow border-l-2 border-white/20 pl-4 italic">
                        {item.note}
                      </p>
                    )}

                    {/* 底部箭头 */}
                    <div className="mt-6 flex items-center justify-between text-xs tracking-[0.3em] uppercase text-white/40 group-hover:text-white transition-colors">
                      <span>Open</span>
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
