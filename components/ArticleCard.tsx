import Link from 'next/link';
import { Article } from '@/lib/api';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {article.coverImage && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
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
        
        <Link href={`/blog/${article.slug}`}>
          <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2">
            {article.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 line-clamp-3 mb-4">
          {article.summary || article.content.replace(/<[^>]*>/g, '').slice(0, 150)}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {article.tagNames?.map((tag, index) => (
            <span
              key={index}
              className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
