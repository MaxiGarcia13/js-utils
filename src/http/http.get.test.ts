import { describe, expect, it } from 'vitest';
import { http } from './http.js';
import { mockFetch } from './http.utils.test.js';

describe('http.get', () => {
  it('returns parsed json', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ id: 1 }),
    });

    await expect(http('/api/users/1').get<{ id: number }>()).resolves.toEqual({ id: 1 });

    expect(fetchMock).toHaveBeenCalledWith('/api/users/1', expect.objectContaining({
      signal: expect.any(AbortSignal),
    }));
  });

  it('appends params to the url', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ items: [] }),
    });

    await expect(http('/api/users').get({
      params: {
        page: 1,
        q: 'max',
        active: true,
        empty: '',
        missing: null,
      },
    })).resolves.toEqual({ items: [] });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/users?page=1&q=max&active=true',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
    expect(fetchMock.mock.calls[0]?.[1]).not.toHaveProperty('params');
  });
});
