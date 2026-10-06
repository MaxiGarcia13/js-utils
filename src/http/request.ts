import { toHeadersRecord } from './headers.js';
import {
  AbortRequestError,
  isAbortError,
  NetworkError,
  throwHttpError,
} from './http-error.js';

const DEFAULT_HEADERS = {
  Accept: 'application/json',
} as const;

function isJsonContentType(contentType: string): boolean {
  return /application\/(?:[a-z0-9.-]+\+)?json/i.test(contentType);
}

export async function request<T>(
  url: string,
  signal: AbortSignal,
  options: RequestInit = {},
): Promise<T> {
  const { headers, ...rest } = options;

  let res: Response;

  try {
    res = await fetch(url, {
      ...rest,
      signal,
      headers: {
        ...DEFAULT_HEADERS,
        ...toHeadersRecord(headers),
      },
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new AbortRequestError('Request aborted', { cause: error });
    }

    throw new NetworkError('Network request failed', { cause: error });
  }

  if (!res.ok) {
    await throwHttpError(res);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type');
  if (contentType && !isJsonContentType(contentType)) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
