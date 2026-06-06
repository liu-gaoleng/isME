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
    // 401 = token 失效/未登录：仅当不在 /login 页时跳转登录，避免循环。
    // 鉴权凭证已改为 HttpOnly Cookie，前端无法读取，故不再依赖 localStorage 判断。
    // 403 = 已登录但权限不足：不跳转，由调用方处理。
    if (response.status === 401 && typeof window !== 'undefined') {
      const onLogin = window.location.pathname.startsWith('/login');
      if (!onLogin) {
        const redirect = encodeURIComponent(
          window.location.pathname + window.location.search
        );
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

// 从 cookie 中读取 CSRF 令牌（Spring 下发的非 HttpOnly 的 XSRF-TOKEN）。
function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// 构造请求头：JSON 内容类型 + 写请求所需的 CSRF 令牌头。
// 鉴权 JWT 由 HttpOnly Cookie 自动携带（credentials: 'include'），无需手动加 Authorization。
function buildHeaders(withCsrf: boolean): Headers {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  if (withCsrf) {
    const csrf = getCsrfToken();
    if (csrf) {
      headers.set('X-XSRF-TOKEN', csrf);
    }
  }

  return headers;
}

export async function get<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: buildHeaders(false),
    credentials: 'include',
  });

  return handleResponse<T>(response);
}

export async function post<T>(url: string, data?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(true),
    credentials: 'include',
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleResponse<T>(response);
}

export async function put<T>(url: string, data?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'PUT',
    headers: buildHeaders(true),
    credentials: 'include',
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleResponse<T>(response);
}

export async function del<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: buildHeaders(true),
    credentials: 'include',
  });

  return handleResponse<T>(response);
}

// 文件上传：用 FormData 提交，不能手动设置 Content-Type（需让浏览器自动带 multipart boundary）。
// 仍需携带 CSRF 令牌头与 Cookie 凭证。
export async function upload<T>(url: string, file: File): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);

  const headers = new Headers();
  const csrf = getCsrfToken();
  if (csrf) {
    headers.set('X-XSRF-TOKEN', csrf);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData,
  });

  return handleResponse<T>(response);
}

export type { ApiResponse, PageResponse };
export { ApiError };
