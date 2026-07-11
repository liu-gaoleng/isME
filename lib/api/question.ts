import { API_ENDPOINTS } from './config';
import { get, post } from './client';

export interface DailyQuestionToday {
  questionId: number;
  text: string;
  /** 今日日期 YYYY-MM-DD */
  date: string;
  answered: boolean;
  answer: string | null;
}

export interface QuestionAnswerItem {
  /** 回答日期 YYYY-MM-DD */
  date: string;
  questionText: string;
  answerText: string;
}

export const questionService = {
  getToday: (): Promise<DailyQuestionToday> =>
    get(`${API_ENDPOINTS.dailyQuestion}/today`),

  getAnswers: (): Promise<QuestionAnswerItem[]> =>
    get(`${API_ENDPOINTS.dailyQuestion}/answers`),

  answerToday: (answerText: string): Promise<DailyQuestionToday> =>
    post(`${API_ENDPOINTS.dailyQuestion}/today/answer`, { answerText }),
};
