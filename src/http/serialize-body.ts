import type { HttpBody, HttpOptionsWithBody } from './types.js';
import { toHeadersRecord } from './headers.js';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function shouldStringify(body: HttpBody): body is Record<string, unknown> | readonly unknown[] {
  return Array.isArray(body) || isPlainObject(body);
}

export function serializeBodyOptions(
  options: HttpOptionsWithBody = {},
): RequestInit & Pick<HttpOptionsWithBody, 'params'> {
  const { body, headers, params, ...rest } = options;
  const serializedBody = body !== undefined && shouldStringify(body)
    ? JSON.stringify(body)
    : body;

  return {
    ...rest,
    ...(params !== undefined ? { params } : {}),
    headers: {
      ...(typeof serializedBody === 'string' ? DEFAULT_HEADERS : {}),
      ...toHeadersRecord(headers),
    },
    ...(serializedBody !== undefined ? { body: serializedBody } : {}),
  };
}
