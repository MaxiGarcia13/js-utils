import type { UrlParams } from '../url/types.js';

export type HttpOptions = Omit<RequestInit, 'method' | 'signal' | 'body'> & {
  params?: UrlParams;
};

export type HttpBody = RequestInit['body'] | Record<string, unknown> | readonly unknown[];

export type HttpOptionsWithBody = HttpOptions & {
  body?: HttpBody;
};
