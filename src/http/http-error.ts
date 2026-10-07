export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'HttpError';
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network request failed', options?: ErrorOptions) {
    super(message, options);
    this.name = 'NetworkError';
  }
}

export class AbortRequestError extends Error {
  constructor(message = 'Request aborted', options?: ErrorOptions) {
    super(message, options);
    this.name = 'AbortRequestError';
  }
}

export class MissingUrlError extends Error {
  constructor(message = 'URL is not set', options?: ErrorOptions) {
    super(message, options);
    this.name = 'MissingUrlError';
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isAbortRequestError(error: unknown): error is AbortRequestError {
  return error instanceof AbortRequestError;
}

export function isMissingUrlError(error: unknown): error is MissingUrlError {
  return error instanceof MissingUrlError;
}

export function requireUrl(url: string): string {
  if (url.length === 0) {
    throw new MissingUrlError();
  }

  return url;
}

export function isAbortError(error: unknown): boolean {
  return (
    (typeof DOMException !== 'undefined' && error instanceof DOMException && error.name === 'AbortError')
    || (error instanceof Error && error.name === 'AbortError')
  );
}

function getErrorMessage(body: unknown): string | undefined {
  if (
    typeof body === 'object'
    && body !== null
    && 'message' in body
    && typeof body.message === 'string'
  ) {
    return body.message;
  }

  return undefined;
}

export async function throwHttpError(res: Response): Promise<never> {
  const body = await res.json().catch(() => null);
  const message = getErrorMessage(body) ?? (res.statusText || `HTTP ${res.status}`);

  throw new HttpError(res.status, message);
}
