import { API_ENDPOINTS } from './config';
import { get, post, put, del } from './client';

export interface Comment {
  id: number;
  content: string;
  authorName: string;
  authorEmail: string;
  articleId: number;
  articleTitle: string;
  isApproved: boolean;
  createdAt: string;
}

export const commentService = {
  getCommentsByArticleId: (articleId: number): Promise<Comment[]> => {
    return get(`${API_ENDPOINTS.comments}/article/${articleId}`);
  },
  
  createComment: (data: Partial<Comment>): Promise<Comment> => {
    return post(API_ENDPOINTS.comments, data);
  },
  
  approveComment: (id: number): Promise<Comment> => {
    return put(`${API_ENDPOINTS.comments}/${id}/approve`, {});
  },
  
  deleteComment: (id: number): Promise<void> => {
    return del(`${API_ENDPOINTS.comments}/${id}`);
  },
  
  countComments: (articleId: number): Promise<number> => {
    return get(`${API_ENDPOINTS.comments}/article/${articleId}/count`);
  },
};
