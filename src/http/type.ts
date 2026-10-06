export type HttpOptions = Omit<RequestInit, 'method' | 'signal' | 'body'>;
export type HttpOptionsWithBody = Omit<RequestInit, 'method' | 'signal'>;
