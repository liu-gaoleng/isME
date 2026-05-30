'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import { Article } from '@/lib/api';

export default function Home() {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar transparent />

      <main className="flex-grow">
        {/* Hero Section - 全屏视频背景 */}
        <section className="relative w-full h-screen overflow-hidden">
          {/* 背景视频 */}
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/videos/hero-bg.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />

          {/* 暗色蒙层，增强文字可读性 */}
          <div className="absolute inset-0 bg-black/40" />

          {/* 中心内容 */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 drop-shadow-lg">
              你好，我是 Liu
            </h1>
            <p className="max-w-2xl text-base md:text-xl text-white/85 leading-relaxed mb-10 drop-shadow">
              一名热爱技术与创造的开发者，
              <br className="hidden md:block" />
              在这里记录我的思考、分享我的项目，
              <br className="hidden md:block" />
              希望与同样热爱探索的你相遇。
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/blog"
                className="inline-block px-8 py-3 rounded-full bg-white/10 backdrop-blur border border-white/40 text-white font-medium hover:bg-white/20 transition-all"
              >
                浏览文章
              </Link>
              <Link
                href="/about"
                className="inline-block px-8 py-3 rounded-full bg-white text-gray-900 font-medium hover:bg-white/90 transition-all"
              >
                了解更多
              </Link>
            </div>
          </div>

          {/* 底部滚动提示 */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/70 text-sm flex flex-col items-center gap-2 animate-bounce">
            <span>向下滚动</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </section>

        {/* Featured Articles */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">精选文章</h2>
            <Link href="/blog" className="text-blue-600 hover:text-blue-800">
              查看更多 →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">加载中...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : featuredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.slice(0, 6).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              暂无文章
            </div>
          )}
        </section>

        {/* Popular Articles */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">热门文章</h2>

            {loading ? (
              <div className="text-center py-12">加载中...</div>
            ) : popularArticles.length > 0 ? (
              <div className="space-y-4">
                {popularArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    className="block p-4 rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl font-bold text-gray-300 mr-4">
                        {index + 1}
                      </span>
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {article.title}
                        </h3>
                        <div className="text-sm text-gray-500 mt-1">
                          {article.viewCount} 阅读 · {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                暂无文章
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
