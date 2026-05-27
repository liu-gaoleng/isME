'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Article } from '@/lib/api';

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/articles/slug/${slug}`
        );
        const result = await response.json();
        
        if (result.code === 200) {
          setArticle(result.data);
        } else {
          setError(result.message || '文章不存在');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">加载中...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">文章不存在</h1>
            <Link href="/blog" className="text-blue-600 hover:text-blue-800">
              返回博客列表
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center text-sm text-gray-500 mb-4">
              {article.categoryName && (
                <>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {article.categoryName}
                  </span>
                  <span className="mx-2">·</span>
                </>
              )}
              <span>{new Date(article.createdAt).toLocaleDateString('zh-CN')}</span>
              <span className="mx-2">·</span>
              <span>{article.viewCount} 阅读</span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>
            
            <div className="flex items-center">
              <span className="text-gray-600">作者：{article.authorName}</span>
            </div>
          </header>

          {/* Cover Image */}
          {article.coverImage && (
            <div className="mb-8">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          {article.tagNames && article.tagNames.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <div className="flex flex-wrap gap-2">
                {article.tagNames.map((tag, index) => (
                  <span
                    key={index}
                    className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 pt-8 border-t">
            <Link href="/blog" className="text-blue-600 hover:text-blue-800">
              ← 返回博客列表
            </Link>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
}
