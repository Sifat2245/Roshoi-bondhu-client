/**
 * Shared API Client
 * Centralizes baseURL, credentials, headers, error normalization, and request execution.
 */

import { demoRequest, isDemoMode } from './demo/demo-store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number = 500, data: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export interface RequestOptions extends RequestInit {
  method?: string;
  data?: any;
  token?: string | null;
  headers?: Record<string, string>;
}

/**
 * Execute an HTTP request with standardized headers and error handling.
 */
export async function apiRequest<T = any>(
  endpoint: string,
  { method = 'GET', data = null, token = null, headers = {}, ...customConfig }: RequestOptions = {}
): Promise<T> {
  if (isDemoMode()) return await demoRequest(endpoint, method, data) as T;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    credentials: 'include',
    headers: requestHeaders,
    ...customConfig,
  };

  // Handle JSON payload
  if (data && !(data instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
    config.body = JSON.stringify(data);
  } else if (data instanceof FormData) {
    config.body = data;
    // Browser automatically sets Content-Type with boundary for FormData
  }

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (networkError: any) {
    throw new ApiError(networkError.message || 'Network connection failed', 0);
  }

  // Parse JSON response
  let responseData: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    const errorMessage =
      responseData?.message ||
      responseData?.error ||
      `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status, responseData);
  }

  return responseData;
}

export const apiClient = {
  get: <T = any>(endpoint: string, options: RequestOptions = {}) =>
    apiRequest<T>(endpoint, { method: 'GET', ...options }),
  post: <T = any>(endpoint: string, data?: any, options: RequestOptions = {}) =>
    apiRequest<T>(endpoint, { method: 'POST', data, ...options }),
  patch: <T = any>(endpoint: string, data?: any, options: RequestOptions = {}) =>
    apiRequest<T>(endpoint, { method: 'PATCH', data, ...options }),
  put: <T = any>(endpoint: string, data?: any, options: RequestOptions = {}) =>
    apiRequest<T>(endpoint, { method: 'PUT', data, ...options }),
  delete: <T = any>(endpoint: string, options: RequestOptions = {}) =>
    apiRequest<T>(endpoint, { method: 'DELETE', ...options }),
  upload: <T = any>(endpoint: string, formData: FormData, options: RequestOptions = {}) =>
    apiRequest<T>(endpoint, { method: 'POST', data: formData, ...options }),
  getBaseUrl: () => API_BASE_URL,
};

export default apiClient;

