import type { BodyOptions } from './serialize-body.js';
import { request } from './request.js';
import { serializeBodyOptions } from './serialize-body.js';

export type HttpOptions = Omit<RequestInit, 'method' | 'body'>;
export type HttpBodyOptions = BodyOptions;
export type { BodyOptions, JsonBody } from './serialize-body.js';

export function http(url: string) {
  const controllers = new Set<AbortController>();

  function run<T>(options: RequestInit = {}) {
    const controller = new AbortController();
    controllers.add(controller);

    return request<T>(url, controller.signal, options).finally(() => {
      controllers.delete(controller);
    });
  }

  return {
    get<T>(options: Omit<HttpOptions, 'body'> = {}) {
      return run<T>(options);
    },
    post<T>(options: HttpBodyOptions = {}) {
      return run<T>({ ...serializeBodyOptions(options), method: 'POST' });
    },
    put<T>(options: HttpBodyOptions = {}) {
      return run<T>({ ...serializeBodyOptions(options), method: 'PUT' });
    },
    delete<T>(options: Omit<HttpOptions, 'body'> = {}) {
      return run<T>({ ...options, method: 'DELETE' });
    },
    patch<T>(options: HttpBodyOptions = {}) {
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
