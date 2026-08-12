export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  // 认证接口
  login: `${API_BASE_URL}/api/auth/login`,
  logout: `${API_BASE_URL}/api/auth/logout`,
  me: `${API_BASE_URL}/api/auth/me`,
  register: `${API_BASE_URL}/api/auth/register`,
  
  // 公开接口
  articles: `${API_BASE_URL}/api/articles`,
  categories: `${API_BASE_URL}/api/categories`,
  comments: `${API_BASE_URL}/api/comments`,
  public: `${API_BASE_URL}/api/public`,
  
  // 管理接口
  users: `${API_BASE_URL}/api/users`,
  admin: `${API_BASE_URL}/api/admin`,

  // 文件上传
  uploadImage: `${API_BASE_URL}/api/upload/image`,

  // 「me」个人模块：画板 / 小确幸 / 每日一问
  boards: `${API_BASE_URL}/api/boards`,
  happyMoments: `${API_BASE_URL}/api/happy-moments`,
  dailyQuestion: `${API_BASE_URL}/api/daily-question`,

  // 站点访问统计（UV 按访客标识去重，PV 每次加载 +1）
  stats: `${API_BASE_URL}/api/stats`,
};

export default API_BASE_URL;
