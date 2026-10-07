import { describe, expect, it } from 'vitest';
import { http } from '../../src/http/http.js';
import { mockFetch } from './http.utils.js';

describe('http.request', () => {
  it.each([
    ['GET'],
    ['POST'],
    ['PUT'],
    ['DELETE'],
    ['PATCH'],
  ] as const)('sends %s method', async (method) => {
    const fetchMock = mockFetch({
      json: async () => ({ ok: true }),
    });

    await expect(http('/api/items').request(method)).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledWith('/api/items', expect.objectContaining({
      method,
      signal: expect.any(AbortSignal),
      headers: expect.objectContaining({
        Accept: 'application/json',
      }),
    }));
  });

  it.each([
    ['POST'],
    ['PUT'],
    ['PATCH'],
  ] as const)('sends json body with %s method', async (method) => {
    const fetchMock = mockFetch({
      json: async () => ({ id: 1 }),
    });
    const body = { name: 'Max' };

    await expect(http('/api/items').request(method, { body })).resolves.toEqual({ id: 1 });

    expect(fetchMock).toHaveBeenCalledWith('/api/items', expect.objectContaining({
      method,
      body: JSON.stringify(body),
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

    await expect(http('/api/items').request('GET', {
      params: { page: 1 },
    })).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/items?page=1',
      expect.objectContaining({
        method: 'GET',
      }),
    );
    expect(fetchMock.mock.calls[0]?.[1]).not.toHaveProperty('params');
  });
});
