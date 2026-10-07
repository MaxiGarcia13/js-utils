import type { HttpOptions, HttpOptionsWithBody } from './types.js';
import { requireUrl } from './http-error.js';
import { createHttpRunners } from './runners.js';
import { serializeBodyOptions } from './serialize-body.js';
import { createHttpStream } from './stream.js';

export function http(baseUrl?: string) {
  let url = baseUrl ?? '';
  const getUrl = () => requireUrl(url);

  const { run, abort, begin, release } = createHttpRunners(getUrl);

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
    setUrl(newUrl: string) {
      url = newUrl;
    },
    request: <T>(method: string, options: HttpOptionsWithBody = {}) => {
      return run<T>({ ...serializeBodyOptions(options), method });
    },
    stream: createHttpStream(getUrl, { begin, release }),
    abort,
  };
}
