import { API_ENDPOINTS } from './config';
import { get, post, put, del, PageResponse } from './client';

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  coverImage: string;
  viewCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  categoryId: number;
  categoryName: string;
  authorId: number;
  authorName: string;
  tagNames: string[];
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const articleService = {
  getPublishedArticles: (page = 0, size = 10): Promise<PageResponse<Article>> => {
    return get(`${API_ENDPOINTS.articles}?page=${page}&size=${size}`);
  },
  
  getArticleById: (id: number): Promise<Article> => {
    return get(`${API_ENDPOINTS.articles}/${id}`);
  },
  
  getArticleBySlug: (slug: string): Promise<Article> => {
    return get(`${API_ENDPOINTS.articles}/slug/${slug}`);
  },
  
  getArticlesByCategory: (categoryId: number, page = 0, size = 10): Promise<PageResponse<Article>> => {
    return get(`${API_ENDPOINTS.articles}/category/${categoryId}?page=${page}&size=${size}`);
  },
  
  getFeaturedArticles: (): Promise<Article[]> => {
    return get(`${API_ENDPOINTS.articles}/featured`);
  },
  
  getPopularArticles: (limit = 5): Promise<Article[]> => {
    return get(`${API_ENDPOINTS.articles}/popular?limit=${limit}`);
  },
  
  createArticle: (data: Partial<Article>): Promise<Article> => {
    return post(`${API_ENDPOINTS.articles}`, data);
  },
  
  updateArticle: (id: number, data: Partial<Article>): Promise<Article> => {
    return put(`${API_ENDPOINTS.articles}/${id}`, data);
  },
  
  deleteArticle: (id: number): Promise<void> => {
    return del(`${API_ENDPOINTS.articles}/${id}`);
  },
};
