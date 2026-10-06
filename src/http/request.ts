import { throwHttpError } from './http-error.js';

export async function request<T>(
  url: string,
  signal: AbortSignal,
  options: RequestInit = {},
): Promise<T> {
  const { ...rest } = options;

  const res = await fetch(url, {
    ...rest,
    signal,
  });

  if (!res.ok) {
    await throwHttpError(res);
  }

  return res.json() as Promise<T>;
}
