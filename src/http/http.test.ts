import { afterEach, describe, expect, it, vi } from 'vitest';
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

describe('http', () => {
  it('get returns parsed json', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ id: 1 }),
    });

    await expect(http('/api/users/1').get<{ id: number }>()).resolves.toEqual({ id: 1 });

    expect(fetchMock).toHaveBeenCalledWith('/api/users/1', expect.objectContaining({
      signal: expect.any(AbortSignal),
    }));
  });

  it('post sends json body with POST method', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ id: 2, name: 'Max' }),
    });

    await expect(http('/api/users').post({
      body: JSON.stringify({ name: 'Max' }),
    })).resolves.toEqual({ id: 2, name: 'Max' });

    expect(fetchMock).toHaveBeenCalledWith('/api/users', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ name: 'Max' }),
      headers: { 'Content-Type': 'application/json' },
    }));
  });

  it('post passes FormData through without json content-type', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ ok: true }),
    });
    const formData = new FormData();
    formData.append('file', 'value');

    await http('/api/upload').post({ body: formData });

    expect(fetchMock).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
      method: 'POST',
      body: formData,
      headers: {},
    }));
  });

  it('post passes Blob through without stringifying', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ ok: true }),
    });
    const blob = new Blob(['hello'], { type: 'text/plain' });

    await http('/api/upload').post({
      body: blob,
      headers: { 'Content-Type': 'text/plain' },
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
      method: 'POST',
      body: blob,
      headers: { 'Content-Type': 'text/plain' },
    }));
  });

  it('put sends json body with PUT method', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ ok: true }),
    });

    await http('/api/users/1').put({ body: JSON.stringify({ name: 'Updated' }) });

    expect(fetchMock).toHaveBeenCalledWith('/api/users/1', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated' }),
    }));
  });

  it('patch sends json body with PATCH method', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ ok: true }),
    });

    await http('/api/users/1').patch({ body: JSON.stringify({ name: 'Patched' }) });

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

  it('allows new requests after abort', async () => {
    const signals: AbortSignal[] = [];

    vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => {
      signals.push(init!.signal!);
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ ok: true }),
      };
    }));

    const client = http('/api/items');
    const first = client.get();
    client.abort();

    expect(signals[0]?.aborted).toBe(true);

    await expect(client.get()).resolves.toEqual({ ok: true });
    expect(signals[1]?.aborted).toBe(false);
    await first;
  });
});
