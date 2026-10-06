export type HttpOptions = Omit<RequestInit, 'method' | 'signal' | 'body'>;

export type HttpBody = RequestInit['body'] | Record<string, unknown> | readonly unknown[];

export type HttpOptionsWithBody = Omit<RequestInit, 'method' | 'signal' | 'body'> & {
  body?: HttpBody;
};
