import type { HttpOptions, HttpOptionsWithBody } from './types.js';
import { createHttpRunners } from './runners.js';
import { serializeBodyOptions } from './serialize-body.js';
import { createHttpStream } from './stream.js';

export function http(url: string) {
  const { run, abort, begin, release } = createHttpRunners(url);

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
    stream: createHttpStream(url, { begin, release }),
    abort,
  };
}
