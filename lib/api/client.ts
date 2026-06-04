interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp?: number;
}

interface PageResponse<T> {
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  content: T[];
}

class ApiError extends Error {
  public readonly code: number;
  public readonly response?: Response;

  constructor(message: string, code: number, response?: Response) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.response = response;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // 鉴权失效：清除本地登录态并跳转登录页（仅浏览器端）
    if ((response.status === 401 || response.status === 403) && typeof window !== 'undefined') {
      const onAdmin = window.location.pathname.startsWith('/admin');
      if (onAdmin) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('authUser');
        const redirect = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?redirect=${redirect}`;
      }
    }

    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const result = await response.json();
      if (result.message) {
        errorMessage = result.message;
      }
    } catch {
    }
    throw new ApiError(errorMessage, response.status, response);
  }

  const result: ApiResponse<T> = await response.json();

  if (result.code !== 200) {
    throw new ApiError(result.message || 'Request failed', result.code);
  }

  return result.data;
}

function getAuthHeaders(): Headers {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  
  const token = localStorage.getItem('accessToken');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return headers;
}

export async function get<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<T>(response);
}

export async function post<T>(url: string, data?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleResponse<T>(response);
}

export async function put<T>(url: string, data?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleResponse<T>(response);
}

export async function del<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleResponse<T>(response);
}

export type { ApiResponse, PageResponse };
export { ApiError };
