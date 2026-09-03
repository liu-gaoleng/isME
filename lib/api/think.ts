import { API_ENDPOINTS } from './config';
import { get, post, put } from './client';

export interface ThinkCurrent {
  questionId: number;
  periodIndex: number;
  category: string;
  questionText: string;
  reviewStatus: 'PASSED' | 'FAILED' | 'SKIPPED';
  reviewNote: string | null;
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
  reviewStatus: 'PASSED' | 'FAILED' | 'SKIPPED';
  reviewNote: string | null;
  periodStart: string;
  periodEnd: string;
  answerHtml: string | null;
  evalStatus: 'NONE' | 'EVALUATING' | 'DONE' | 'FAILED';
  aiFeedback: string | null;
}

export const thinkService = {
  getCurrent: () => get<ThinkCurrent>(`${API_ENDPOINTS.think}/current`),
  getHistory: () => get<ThinkHistoryItem[]>(`${API_ENDPOINTS.think}/history`),
  getQuestion: (questionId: number) =>
    get<ThinkHistoryItem>(`${API_ENDPOINTS.think}/questions/${questionId}`),
  saveAnswer: (questionId: number, answerHtml: string) =>
    put<ThinkHistoryItem>(`${API_ENDPOINTS.think}/questions/${questionId}/answer`, { answerHtml }),
  submit: (questionId: number, answerHtml: string) =>
    post<ThinkHistoryItem>(`${API_ENDPOINTS.think}/questions/${questionId}/submit`, { answerHtml }),
  regenerate: () => post<ThinkCurrent>(`${API_ENDPOINTS.think}/current/regenerate`, {}),
};
