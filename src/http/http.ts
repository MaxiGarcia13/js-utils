import type { HttpOptions, HttpOptionsWithBody } from './type.js';
import { request } from './request.js';
import { serializeBodyOptions } from './serialize-body.js';

export function http(url: string) {
  const controllers = new Set<AbortController>();

  async function run<T>(options: RequestInit = {}) {
    const controller = new AbortController();
    controllers.add(controller);

    return request<T>(url, controller.signal, options).finally(() => {
      controllers.delete(controller);
    });
  }

  return {
    get<T>(options: HttpOptions = {}) {
      return run<T>(options);
    },
    post<T>(options: HttpOptionsWithBody = {}) {
      return run<T>({ ...serializeBodyOptions(options), method: 'POST' });
    },
    put<T>(options: HttpOptionsWithBody = {}) {
      return run<T>({ ...serializeBodyOptions(options), method: 'PUT' });
    },
    delete<T>(options: HttpOptions = {}) {
      return run<T>({ ...options, method: 'DELETE' });
    },
    patch<T>(options: HttpOptionsWithBody = {}) {
      return run<T>({ ...serializeBodyOptions(options), method: 'PATCH' });
    },
    abort() {
      for (const controller of controllers) {
        controller.abort();
      }
      controllers.clear();
    },
  };
}
