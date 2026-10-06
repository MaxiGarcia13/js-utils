import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpError, isHttpError, throwHttpError } from './http-error.js';
import { http } from './http.js';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function mockFetch(res: Partial<Response> & { json?: () => Promise<unknown> }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({}),
    ...res,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('isHttpError', () => {
  it('returns true for HttpError instances', () => {
    expect(isHttpError(new HttpError(404, 'Not found'))).toBe(true);
  });

  it('returns true for objects with status and message', () => {
    expect(isHttpError({ status: 500, message: 'Server error' })).toBe(true);
  });

  it('returns false for unrelated values', () => {
    expect(isHttpError(null)).toBe(false);
    expect(isHttpError('error')).toBe(false);
    expect(isHttpError({ message: 'missing status' })).toBe(false);
    expect(isHttpError({ status: 400 })).toBe(false);
  });
});

describe('throwHttpError', () => {
  it('throws HttpError with body message when body has status and message', async () => {
    const res = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ status: 404, message: 'User not found' }),
    } as Response;

    await expect(throwHttpError(res)).rejects.toMatchObject({
      name: 'HttpError',
      status: 404,
      message: 'User not found',
    });
  });

  it('throws HttpError with statusText when body is not an http error shape', async () => {
    const res = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'boom' }),
    } as Response;

    await expect(throwHttpError(res)).rejects.toMatchObject({
      name: 'HttpError',
      status: 500,
      message: 'Internal Server Error',
    });
  });

  it('falls back to HTTP status when statusText is empty and body is invalid', async () => {
    const res = {
      ok: false,
      status: 502,
      statusText: '',
      json: async () => {
        throw new Error('invalid json');
      },
    } as unknown as Response;

    await expect(throwHttpError(res)).rejects.toMatchObject({
      name: 'HttpError',
      status: 502,
      message: 'HTTP 502',
    });
  });
});

describe('http', () => {
  it('get returns parsed json', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ id: 1 }),
    });

    await expect(http('/api/users/1').get<{ id: number }>()).resolves.toEqual({ id: 1 });

    expect(fetchMock).toHaveBeenCalledWith('/api/users/1', expect.objectContaining({
      headers: { 'Content-Type': 'application/json' },
      signal: expect.any(AbortSignal),
    }));
  });

  it('post sends json body with POST method', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ id: 2, name: 'Max' }),
    });

    await expect(http('/api/users').post({ name: 'Max' })).resolves.toEqual({ id: 2, name: 'Max' });

    expect(fetchMock).toHaveBeenCalledWith('/api/users', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ name: 'Max' }),
      headers: { 'Content-Type': 'application/json' },
    }));
  });

  it('put sends json body with PUT method', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ ok: true }),
    });

    await http('/api/users/1').put({ name: 'Updated' });

    expect(fetchMock).toHaveBeenCalledWith('/api/users/1', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated' }),
    }));
  });

  it('patch sends json body with PATCH method', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ ok: true }),
    });

    await http('/api/users/1').patch({ name: 'Patched' });

    expect(fetchMock).toHaveBeenCalledWith('/api/users/1', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ name: 'Patched' }),
    }));
  });

  it('delete uses DELETE method', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ deleted: true }),
    });

    await expect(http('/api/users/1').delete()).resolves.toEqual({ deleted: true });

    expect(fetchMock).toHaveBeenCalledWith('/api/users/1', expect.objectContaining({
      method: 'DELETE',
    }));
  });

  it('throws HttpError when response is not ok', async () => {
    mockFetch({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ status: 401, message: 'Invalid token' }),
    });

    await expect(http('/api/me').get()).rejects.toMatchObject({
      name: 'HttpError',
      status: 401,
      message: 'Invalid token',
    });
  });

  it('abort aborts the request signal', async () => {
    let capturedSignal: AbortSignal | undefined;

    vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => {
      capturedSignal = init?.signal ?? undefined;
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({}),
      };
    }));

    const client = http('/api/slow');
    const pending = client.get();
    client.abort();

    expect(capturedSignal?.aborted).toBe(true);
    await expect(pending).resolves.toEqual({});
  });
});
