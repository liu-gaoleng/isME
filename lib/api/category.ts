import { API_ENDPOINTS } from './config';
import { get, post, put, del } from './client';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export const categoryService = {
  getAllCategories: (): Promise<Category[]> => {
    return get(API_ENDPOINTS.categories);
  },
  
  getCategoryById: (id: number): Promise<Category> => {
    return get(`${API_ENDPOINTS.categories}/${id}`);
  },
  
  getCategoryBySlug: (slug: string): Promise<Category> => {
    return get(`${API_ENDPOINTS.categories}/slug/${slug}`);
  },
  
  createCategory: (data: Partial<Category>): Promise<Category> => {
    return post(API_ENDPOINTS.categories, data);
  },
  
  updateCategory: (id: number, data: Partial<Category>): Promise<Category> => {
    return put(`${API_ENDPOINTS.categories}/${id}`, data);
  },
  
  deleteCategory: (id: number): Promise<void> => {
    return del(`${API_ENDPOINTS.categories}/${id}`);
  },
};
