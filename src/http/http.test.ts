import { describe, expect, it, vi } from 'vitest';
import { http } from './http.js';
import { mockFetch } from './http.utils.test.js';

describe('http', () => {
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
