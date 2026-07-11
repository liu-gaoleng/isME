import { API_ENDPOINTS } from './config';
import { get, post, put, del } from './client';

export interface HappyMoment {
  id: number;
  content: string;
  /** 发生日期 YYYY-MM-DD */
  happenedOn: string;
  createdAt: string;
}

export const happyService = {
  list: (): Promise<HappyMoment[]> => get(API_ENDPOINTS.happyMoments),

  create: (data: { content: string; happenedOn?: string }): Promise<HappyMoment> =>
    post(API_ENDPOINTS.happyMoments, data),

  update: (id: number, data: { content?: string; happenedOn?: string }): Promise<HappyMoment> =>
    put(`${API_ENDPOINTS.happyMoments}/${id}`, data),

  remove: (id: number): Promise<void> => del(`${API_ENDPOINTS.happyMoments}/${id}`),
};
