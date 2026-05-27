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
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              欢迎来到我的个人网站
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              分享技术，记录生活
            </p>
            <Link
              href="/blog"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              浏览文章
            </Link>
          </div>
        </section>

        {/* Featured Articles */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        <section className="bg-white py-12">
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
