import type { HttpOptions } from './types.js';
import { addParamsToUrl } from '../url/index.js';
import { request } from './request.js';

export interface AbortTracker {
  begin: (key: string) => AbortController;
  release: (key: string, controller: AbortController) => void;
}

export function createHttpRunners(getUrl: () => string) {
  const controllers = new Map<string, AbortController>();

  function begin(key: string) {
    controllers.get(key)?.abort();
    const controller = new AbortController();
    controllers.set(key, controller);
    return controller;
  }

  function release(key: string, controller: AbortController) {
    if (controllers.get(key) === controller) {
      controllers.delete(key);
    }
  }

  async function run<T>({
    params,
    method = 'GET',
    ...options
  }: RequestInit & Pick<HttpOptions, 'params'> = {}) {
    const finalUrl = addParamsToUrl(getUrl(), params);
    const key = `${method}:${finalUrl}`;
    const controller = begin(key);

    return request<T>(finalUrl, controller.signal, { ...options, method }).finally(() => {
      release(key, controller);
    });
  }

  function abort() {
    for (const controller of controllers.values()) {
      controller.abort();
    }
    controllers.clear();
  }

  return { run, abort, begin, release };
}
