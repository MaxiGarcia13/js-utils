import { throwHttpError } from './http-error.js';

function resolveSignal(
  internal: AbortSignal,
  external?: AbortSignal | null,
): AbortSignal {
  if (!external) {
    return internal;
  }

  return AbortSignal.any([internal, external]);
}

export async function request<T>(
  url: string,
  signal: AbortSignal,
  options: RequestInit = {},
): Promise<T> {
  const { signal: externalSignal, ...rest } = options;

  const res = await fetch(url, {
    ...rest,
    signal: resolveSignal(signal, externalSignal),
  });

  if (!res.ok) {
    await throwHttpError(res);
  }

  return res.json() as Promise<T>;
}
