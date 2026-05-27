import { post } from './client';
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

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserDTO;
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  return post<LoginResponse>(API_ENDPOINTS.login, request);
}

export async function register(request: RegisterRequest): Promise<UserDTO> {
  return post<UserDTO>(API_ENDPOINTS.register, request);
}

export function setAuthToken(token: string): void {
  localStorage.setItem('accessToken', token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem('accessToken');
}

export function removeAuthToken(): void {
  localStorage.removeItem('accessToken');
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}
