import { toHeadersRecord } from './headers.js';
import { throwHttpError } from './http-error.js';

const DEFAULT_HEADERS = {
  Accept: 'application/json',
} as const;

export async function request<T>(
  url: string,
  signal: AbortSignal,
  options: RequestInit = {},
): Promise<T> {
  const { headers, ...rest } = options;

  const res = await fetch(url, {
    ...rest,
    signal,
    headers: {
      ...DEFAULT_HEADERS,
      ...toHeadersRecord(headers),
    },
  });

  if (!res.ok) {
    await throwHttpError(res);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
