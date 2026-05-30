import Link from 'next/link';
import { Article } from '@/lib/api';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group block bg-white/[0.02] border border-white/10 hover:border-white/40 hover:bg-white/[0.05] overflow-hidden transition-all duration-300"
    >
      {article.coverImage && (
        <div className="aspect-video w-full overflow-hidden bg-black">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center text-xs tracking-widest uppercase text-white/50 mb-3">
          {article.categoryName && (
            <>
              <span className="border border-white/30 text-white/80 text-[10px] px-2 py-0.5">
                {article.categoryName}
              </span>
              <span className="mx-2">·</span>
            </>
          )}
          <span>{new Date(article.createdAt).toLocaleDateString('zh-CN')}</span>
          <span className="mx-2">·</span>
          <span>{article.viewCount} Views</span>
        </div>

        <h3 className="text-xl font-semibold text-white group-hover:text-white mb-3">
          {article.title}
        </h3>

        <p className="text-white/60 line-clamp-3 mb-4 text-sm leading-relaxed">
          {article.summary || article.content.replace(/<[^>]*>/g, '').slice(0, 150)}
        </p>

        <div className="flex flex-wrap gap-2">
          {article.tagNames?.map((tag, index) => (
            <span
              key={index}
              className="text-[10px] tracking-wider uppercase text-white/50 border border-white/15 px-2 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
