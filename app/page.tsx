'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import { Article } from '@/lib/api';
import { useScrollReveal } from '@/lib/useScrollReveal';

export default function Home() {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
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
        const [featured, popular] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/articles/featured`).then(r => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/articles/popular?limit=5`).then(r => r.json()),
        ]);

        setFeaturedArticles(featured.data || []);
        setPopularArticles(popular.data || []);
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
            <div className="text-xs md:text-sm tracking-[0.4em] uppercase text-white/60 mb-6 reveal">
              Personal Site
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-8 reveal reveal-delay-1">
              Hello,
              <br />
              I&apos;m <span className="italic font-light">Liu</span>.
            </h1>
            <p className="max-w-xl text-base md:text-lg text-white/70 leading-relaxed mb-10 reveal reveal-delay-2">
              一名热爱技术与创造的开发者，在这里记录我的过去、现在与未来。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 reveal reveal-delay-3">
              <Link
                href="#manifesto"
                className="inline-flex items-center justify-center px-8 py-3 border border-white/40 text-white text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all"
              >
                进入故事
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent bg-white text-black text-sm tracking-widest uppercase hover:bg-white/85 transition-all"
              >
                了解经历
              </Link>
            </div>
          </div>

          {/* 底部滚动提示 */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-white/60 text-xs tracking-[0.3em] uppercase flex flex-col items-center gap-3">
            <span>Scroll</span>
            <span className="block w-px h-10 bg-white/40 animate-pulse" />
          </div>
        </section>

        {/* Manifesto / 引言 */}
        <section id="manifesto" className="relative bg-black py-32 md:py-44 border-t border-white/10 overflow-hidden">
          <span className="chapter-bg top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
            MANIFESTO
          </span>
          <div className="relative max-w-5xl mx-auto px-6 sm:px-10 lg:px-14">
            <div className="text-xs tracking-[0.4em] uppercase text-white/50 mb-6 reveal">
              — 序章 / Manifesto
            </div>
            <p className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight reveal reveal-delay-1">
              我相信代码与文字
              <br />
              都能成为
              <span className="italic font-light text-white/80"> 改变世界 </span>
              的杠杆。
            </p>
            <p className="mt-8 max-w-2xl text-base md:text-lg text-white/60 leading-relaxed reveal reveal-delay-2">
              在每一次回望、每一次冲撞与每一次构想之中，我把自己交给时间——以坦诚的笔触，记下走过的路、正在做的事，和那些尚未抵达的远方。
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
                <div className="text-xs tracking-[0.4em] uppercase text-white/50 mb-4">
                  Chapter 01
                </div>
                <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                  过去
                </h2>
                <div className="mt-4 text-sm tracking-widest uppercase text-white/40">
                  Past — Where I came from
                </div>
              </div>
              <div className="lg:col-span-8">
                <ul className="relative border-l border-white/15 pl-8 md:pl-12 space-y-12">
                  {[
                    {
                      year: '童年',
                      title: '与好奇心相遇',
                      desc: '在一台旧电脑前敲下第一行代码，从此被「让机器听懂自己」这件事彻底吸引。',
                    },
                    {
                      year: '学生时代',
                      title: '从兴趣到方法',
                      desc: '在算法、操作系统、网络协议之间反复跌倒又爬起，理解到优雅来自约束、清晰源于训练。',
                    },
                    {
                      year: '初入职场',
                      title: '面对真实的世界',
                      desc: '第一次看见自己写下的代码被成千上万的人使用，那种敬畏感至今犹在。',
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
            <div className="text-xs tracking-[0.4em] uppercase text-white/50 mb-4 reveal">
              Chapter 02
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 reveal reveal-delay-1">
              现在
            </h2>
            <div className="text-sm tracking-widest uppercase text-white/40 mb-12 reveal reveal-delay-1">
              Present — What I am building
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: '工程实践',
                  en: 'Engineering',
                  desc: '在前后端、基础设施与体验之间寻找平衡，把复杂留给自己，把简洁交给用户。',
                },
                {
                  title: '持续学习',
                  en: 'Learning',
                  desc: '每天读、每天写、每天调试。技术变化是常态，我把保持好奇当成生活方式。',
                },
                {
                  title: '记录与分享',
                  en: 'Sharing',
                  desc: '在这个网站记下作品与思考，希望能成为同行路上的一束微光。',
                },
              ].map((item, idx) => (
                <div
                  key={item.title}
                  className={`group relative border border-white/10 p-8 md:p-10 hover:border-white/40 hover:bg-white/[0.04] transition-all duration-500 reveal reveal-delay-${Math.min(idx + 1, 3)}`}
                >
                  <div className="text-[11px] tracking-[0.35em] uppercase text-white/40 mb-4">
                    {item.en}
                  </div>
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
          <div className="relative max-w-5xl mx-auto px-6 sm:px-10 lg:px-14">
            <div className="text-xs tracking-[0.4em] uppercase text-white/50 mb-4 reveal">
              Chapter 03
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 reveal reveal-delay-1">
              将来
            </h2>
            <div className="text-sm tracking-widest uppercase text-white/40 mb-14 reveal reveal-delay-1">
              Future — Where I&apos;m heading
            </div>

            <blockquote className="reveal reveal-delay-2">
              <p className="text-3xl md:text-5xl font-extrabold leading-[1.2] tracking-tight">
                <span className="text-white/40">「</span>
                把工具做得更轻，把人与世界的距离拉得更近——
                这是我希望用余下的所有时间去做的事。
                <span className="text-white/40">」</span>
              </p>
              <footer className="mt-6 text-xs tracking-[0.4em] uppercase text-white/50">
                — Liu, On A Late Night
              </footer>
            </blockquote>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: '更好的产品',
                  desc: '相信「细节决定灵魂」，希望我做的每一个产品都对得起使用它的人。',
                },
                {
                  title: '更广的影响',
                  desc: '走到更远的地方、与更多领域的人合作，让技术成为真实变化的载体。',
                },
              ].map((item, idx) => (
                <div
                  key={item.title}
                  className={`border-l-2 border-white/30 pl-6 md:pl-8 py-2 reveal reveal-delay-${idx + 2}`}
                >
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed">{item.desc}</p>
                </div>
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
            <div className="text-xs tracking-[0.4em] uppercase text-white/50 mb-6 reveal">
              Chapter 04
            </div>
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tight leading-[0.95] reveal reveal-delay-1">
              改变
              <br />
              <span className="italic font-light text-white/85">世界</span>。
            </h2>
            <p className="mt-12 max-w-2xl mx-auto text-base md:text-lg text-white/65 leading-relaxed reveal reveal-delay-2">
              这不是一句口号。它是每个清晨我推开门时的提醒——
              <br className="hidden md:block" />
              你可以更勇敢一点、更慷慨一点、更有耐心一点。
              <br className="hidden md:block" />
              世界也许不会因为某一行代码骤然改变，但它一定会因为
              <span className="text-white"> 不肯停下的人 </span>
              而慢慢不同。
            </p>

            <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center reveal reveal-delay-3">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center px-10 py-4 border border-white/40 text-white text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all"
              >
                查看作品
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

        {/* Works / 作品 */}
        <section id="works" className="bg-black py-24 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
            <div className="flex justify-between items-end mb-12 reveal">
              <div>
                <div className="text-xs tracking-[0.4em] uppercase text-white/50 mb-3">
                  05 — Works
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white">作品</h2>
              </div>
              <Link
                href="/blog"
                className="hidden md:inline-block text-sm tracking-widest uppercase text-white/70 hover:text-white border-b border-white/30 hover:border-white pb-1 transition-colors"
              >
                View All →
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
              <div className="text-center py-12 text-white/50">暂无作品</div>
            )}
          </div>
        </section>

        {/* Hobbies / 爱好 */}
        <section id="hobbies" className="bg-black py-24 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
            <div className="mb-12 reveal">
              <div className="text-xs tracking-[0.4em] uppercase text-white/50 mb-3">
                06 — Hobbies
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">爱好</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: '编程 / Coding', desc: '探索新的语言、框架与开发工具，乐于解决复杂问题。' },
                { title: '阅读 / Reading', desc: '科技、人文、设计——在不同领域间汲取灵感。' },
                { title: '影像 / Visuals', desc: '关注视觉表达与动画，热爱有质感的设计语言。' },
              ].map((item, idx) => (
                <div
                  key={item.title}
                  className={`border border-white/10 p-8 hover:border-white/40 hover:bg-white/[0.03] transition-all duration-300 reveal reveal-delay-${Math.min(idx + 1, 3)}`}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-white/60 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular / 热门 */}
        <section id="popular" className="bg-black py-24 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
            <div className="mb-12 reveal">
              <div className="text-xs tracking-[0.4em] uppercase text-white/50 mb-3">
                07 — Popular
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">热门</h2>
            </div>

            {loading ? (
              <div className="text-center py-12 text-white/60">加载中...</div>
            ) : popularArticles.length > 0 ? (
              <div className="divide-y divide-white/10 border-y border-white/10">
                {popularArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    className="group flex items-center gap-6 py-6 hover:bg-white/[0.03] px-2 transition-colors reveal"
                  >
                    <span className="text-3xl md:text-4xl font-light text-white/30 w-12 tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-grow">
                      <h3 className="text-lg md:text-xl font-medium text-white group-hover:text-white/90">
                        {article.title}
                      </h3>
                      <div className="text-xs tracking-widest uppercase text-white/40 mt-2">
                        {article.viewCount} Views · {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                    <span className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all">→</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/50">暂无内容</div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
