export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return (
    typeof error === 'object'
    && error !== null
    && 'status' in error
    && 'message' in error
  );
}

export async function throwHttpError(res: Response): Promise<never> {
  const body = await res.json().catch(() => null);

  if (isHttpError(body)) {
    throw new HttpError(res.status, body.message);
  }

  throw new HttpError(res.status, res.statusText || `HTTP ${res.status}`);
}
