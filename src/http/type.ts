import type { UrlParams } from '../url/types.js';

export type HttpOptions = Omit<RequestInit, 'method' | 'signal' | 'body'>;

export type HttpGetOptions = HttpOptions & { params?: UrlParams };

export type HttpBody = RequestInit['body'] | Record<string, unknown> | readonly unknown[];

export type HttpOptionsWithBody = Omit<RequestInit, 'method' | 'signal' | 'body'> & {
  body?: HttpBody;
};
