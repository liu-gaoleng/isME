'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import { Article } from '@/lib/api';

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/articles?page=${page}&size=9`
        );
        const result = await response.json();
        
        if (result.code === 200) {
          setArticles(result.data.content || []);
          setTotalPages(result.data.totalPages || 0);
        } else {
          setError(result.message || '加载失败');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [page]);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-12">
            产品
          </h1>

          {loading ? (
            <div className="text-center py-12 text-white/60">加载中...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">{error}</div>
          ) : articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-6 py-2 border border-white/30 text-sm tracking-widest uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:text-black transition-all"
                  >
                    Prev
                  </button>
                  <span className="px-2 text-xs tracking-widest uppercase text-white/60">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-6 py-2 border border-white/30 text-sm tracking-widest uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:text-black transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-white/50">
              暂无内容
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
