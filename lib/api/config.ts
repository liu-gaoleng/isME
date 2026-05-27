const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  // 认证接口
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  
  // 公开接口
  articles: `${API_BASE_URL}/api/articles`,
  categories: `${API_BASE_URL}/api/categories`,
  comments: `${API_BASE_URL}/api/comments`,
  public: `${API_BASE_URL}/api/public`,
  
  // 管理接口
  users: `${API_BASE_URL}/api/users`,
  admin: `${API_BASE_URL}/api/admin`,
};

export default API_BASE_URL;
