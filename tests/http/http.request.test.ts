import { describe, expect, it } from 'vitest';
import { http } from '../../src/http/http.js';
import { mockFetch } from './http.utils.js';

describe('http.request', () => {
  it('sends a custom method', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ ok: true }),
    });

    await expect(http('/api/users/1').request('HEAD')).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledWith('/api/users/1', expect.objectContaining({
      method: 'HEAD',
      signal: expect.any(AbortSignal),
      headers: expect.objectContaining({
        Accept: 'application/json',
      }),
    }));
  });

  it('sends a custom method with json body', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ id: 1 }),
    });

    await expect(http('/api/reports').request('REPORT', {
      body: { type: 'summary' },
    })).resolves.toEqual({ id: 1 });

    expect(fetchMock).toHaveBeenCalledWith('/api/reports', expect.objectContaining({
      method: 'REPORT',
      body: JSON.stringify({ type: 'summary' }),
      headers: expect.objectContaining({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }),
    }));
  });

  it('appends params to the url', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ ok: true }),
    });

    await expect(http('/api/users').request('OPTIONS', {
      params: { verbose: true },
    })).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/users?verbose=true',
      expect.objectContaining({
        method: 'OPTIONS',
      }),
    );
    expect(fetchMock.mock.calls[0]?.[1]).not.toHaveProperty('params');
  });
});
