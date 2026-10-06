import type { HttpOptions, HttpOptionsWithBody } from './types.js';
import { addParamsToUrl } from '../url/index.js';
import { request } from './request.js';
import { serializeBodyOptions } from './serialize-body.js';

export function http(url: string) {
  const controllers = new Map<string, AbortController>();

  async function run<T>({
    params,
    method = 'GET',
    ...options
  }: RequestInit & Pick<HttpOptions, 'params'> = {}) {
    const finalUrl = addParamsToUrl(url, params);
    const key = `${method}:${finalUrl}`;

    controllers.get(key)?.abort();

    const controller = new AbortController();
    controllers.set(key, controller);

    return request<T>(
      finalUrl,
      controller.signal,
      { ...options, method },
    ).finally(() => {
      if (controllers.get(key) === controller) {
        controllers.delete(key);
      }
    });
  }

  return {
    get<T>(options: HttpOptions = {}) {
      return run<T>({ ...options, method: 'GET' });
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
      for (const controller of controllers.values()) {
        controller.abort();
      }
      controllers.clear();
    },
  };
}
