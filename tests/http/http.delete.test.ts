import { describe, expect, it } from 'vitest';
import { http } from '../../src/http/http.js';
import { mockFetch } from './http.utils.js';

describe('http.delete', () => {
  it('uses DELETE method', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ deleted: true }),
    });

    await expect(http('/api/users/1').delete()).resolves.toEqual({ deleted: true });

    expect(fetchMock).toHaveBeenCalledWith('/api/users/1', expect.objectContaining({
      method: 'DELETE',
      headers: expect.objectContaining({
        Accept: 'application/json',
      }),
    }));
  });

  it('appends params to the url', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ deleted: true }),
    });

    await expect(http('/api/users/1').delete({
      params: { soft: true },
    })).resolves.toEqual({ deleted: true });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/users/1?soft=true',
      expect.objectContaining({
        method: 'DELETE',
      }),
    );
    expect(fetchMock.mock.calls[0]?.[1]).not.toHaveProperty('params');
  });
});
