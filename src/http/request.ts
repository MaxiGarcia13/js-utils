import { throwHttpError } from './http-error.js';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const;

export async function request<T>(
  url: string,
  signal: AbortSignal,
  options: RequestInit = {},
  data?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    signal,
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...options.headers,
    },
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
  });

  if (!res.ok) {
    await throwHttpError(res);
  }

  return res.json() as Promise<T>;
}
