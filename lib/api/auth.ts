import { post, get } from './client';
import { API_ENDPOINTS } from './config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  role: string;
}

// 登录响应：JWT 已通过 HttpOnly Cookie 下发，响应体仅含当前用户信息。
export interface LoginResponse {
  user: UserDTO;
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  return post<LoginResponse>(API_ENDPOINTS.login, request);
}

export async function register(request: RegisterRequest): Promise<UserDTO> {
  return post<UserDTO>(API_ENDPOINTS.register, request);
}

// 退出登录：由后端清除 HttpOnly Cookie。
export async function logout(): Promise<void> {
  await post<void>(API_ENDPOINTS.logout);
}

// 获取当前登录用户。未登录时后端返回 401，client 会抛出 ApiError。
export async function getMe(): Promise<UserDTO> {
  return get<UserDTO>(API_ENDPOINTS.me);
}
