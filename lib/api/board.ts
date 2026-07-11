import { API_ENDPOINTS } from './config';
import { get, post, put, del } from './client';

export interface Board {
  id: number;
  title: string;
  /** Excalidraw 场景 JSON 字符串；列表接口不返回，仅详情返回 */
  sceneJson?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const boardService = {
  list: (): Promise<Board[]> => get(API_ENDPOINTS.boards),

  getById: (id: number): Promise<Board> => get(`${API_ENDPOINTS.boards}/${id}`),

  create: (data: { title?: string; sceneJson?: string }): Promise<Board> =>
    post(API_ENDPOINTS.boards, data),

  update: (id: number, data: { title?: string; sceneJson?: string }): Promise<Board> =>
    put(`${API_ENDPOINTS.boards}/${id}`, data),

  remove: (id: number): Promise<void> => del(`${API_ENDPOINTS.boards}/${id}`),
};
