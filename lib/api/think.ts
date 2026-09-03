import { API_ENDPOINTS } from './config';
import { get, post, put } from './client';

export interface ThinkCurrent {
  questionId: number;
  periodIndex: number;
  category: string;
  questionText: string;
  periodStart: string;
  periodEnd: string;
  aiAvailable: boolean;
  answerHtml: string | null;
  evalStatus: 'NONE' | 'EVALUATING' | 'DONE' | 'FAILED';
  aiFeedback: string | null;
}

export interface ThinkHistoryItem {
  questionId: number;
  periodIndex: number;
  category: string;
  questionText: string;
  periodStart: string;
  periodEnd: string;
  answerHtml: string | null;
  evalStatus: 'NONE' | 'EVALUATING' | 'DONE' | 'FAILED';
  aiFeedback: string | null;
}

export const thinkService = {
  getCurrent: () => get<ThinkCurrent>(`${API_ENDPOINTS.think}/current`),
  getHistory: () => get<ThinkHistoryItem[]>(`${API_ENDPOINTS.think}/history`),
  saveAnswer: (answerHtml: string) =>
    put<ThinkCurrent>(`${API_ENDPOINTS.think}/current/answer`, { answerHtml }),
  submit: (answerHtml: string) =>
    post<ThinkCurrent>(`${API_ENDPOINTS.think}/current/submit`, { answerHtml }),
  regenerate: () => post<ThinkCurrent>(`${API_ENDPOINTS.think}/current/regenerate`, {}),
};
