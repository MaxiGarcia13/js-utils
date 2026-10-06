import { throwHttpError } from './http-error.js';

export async function request<T>(
  url: string,
  signal: AbortSignal,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    signal,
  });

  if (!res.ok) {
    await throwHttpError(res);
  }

  return res.json() as Promise<T>;
}
