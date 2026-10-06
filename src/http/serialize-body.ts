import type { HttpOptionsWithBody } from './type.js';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const;

function shouldSkipJsonContentType(body: RequestInit['body']): boolean {
  return (
    (typeof FormData !== 'undefined' && body instanceof FormData)
    || (typeof Blob !== 'undefined' && body instanceof Blob)
  );
}

export function serializeBodyOptions(options: HttpOptionsWithBody = {}): RequestInit {
  const { body, headers, ...rest } = options;

  return {
    ...rest,
    headers: {
      ...(!shouldSkipJsonContentType(body) ? DEFAULT_HEADERS : {}),
      ...headers,
    },
    ...(body !== undefined ? { body } : {}),
  };
}
