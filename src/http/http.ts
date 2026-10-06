import { request } from './request.js';

export function http(url: string) {
  const abortController = new AbortController();
  const { signal } = abortController;

  return {
    get<T>(options: RequestInit = {}) {
      return request<T>(url, signal, options);
    },
    post<T, K = unknown>(data: K, options: RequestInit = {}) {
      return request<T>(url, signal, { ...options, method: 'POST' }, data);
    },
    put<T, K = unknown>(data: K, options: RequestInit = {}) {
      return request<T>(url, signal, { ...options, method: 'PUT' }, data);
    },
    delete<T>(options: RequestInit = {}) {
      return request<T>(url, signal, { ...options, method: 'DELETE' });
    },
    patch<T, K = unknown>(data: K, options: RequestInit = {}) {
      return request<T>(url, signal, { ...options, method: 'PATCH' }, data);
    },
    abort() {
      abortController.abort();
    },
  };
}
