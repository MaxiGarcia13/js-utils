import type { HttpOptions, HttpOptionsWithBody } from './types.js';
import { addParamsToUrl } from '../url/index.js';
import { request } from './request.js';
import { serializeBodyOptions } from './serialize-body.js';

export function http(url: string) {
  const controllers = new Set<AbortController>();

  async function run<T>({ params, ...options }: RequestInit & Pick<HttpOptions, 'params'> = {}) {
    const controller = new AbortController();
    controllers.add(controller);

    return request<T>(addParamsToUrl(url, params), controller.signal, options).finally(() => {
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
