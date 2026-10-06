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

  it('returns undefined for 204 responses', async () => {
    mockFetch({
      status: 204,
      text: async () => '',
    });

    await expect(http('/api/users/1').delete()).resolves.toBeUndefined();
  });

  it('returns undefined for empty response bodies', async () => {
    mockFetch({
      status: 200,
      text: async () => '',
    });

    await expect(http('/api/users/1').get()).resolves.toBeUndefined();
  });

  it('returns undefined when content-type is not json', async () => {
    mockFetch({
      status: 200,
      headers: { 'content-type': 'text/plain' },
      text: async () => 'not json',
    });

    await expect(http('/api/users/1').get()).resolves.toBeUndefined();
  });

  it('parses json when content-type is missing', async () => {
    mockFetch({
      status: 200,
      headers: {},
      text: async () => JSON.stringify({ id: 1 }),
    });

    await expect(http('/api/users/1').get()).resolves.toEqual({ id: 1 });
  });

  it('throws NetworkError when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }));

    await expect(http('/api/users').get()).rejects.toMatchObject({
      name: 'NetworkError',
      message: 'Network request failed',
    });
  });

  it('throws AbortRequestError when fetch is aborted', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new DOMException('The operation was aborted.', 'AbortError');
    }));

    await expect(http('/api/users').get()).rejects.toMatchObject({
      name: 'AbortRequestError',
      message: 'Request aborted',
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
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => '{}',
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
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ ok: true }),
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
