import { describe, expect, it } from 'vitest';
import { http } from './http.js';
import { mockFetch } from './http.utils.test.js';

describe('http.patch', () => {
  it('sends json body with PATCH method', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ id: 1, name: 'Patched' }),
    });

    await expect(http('/api/users/1').patch({
      body: { name: 'Patched' },
    })).resolves.toEqual({ id: 1, name: 'Patched' });

    expect(fetchMock).toHaveBeenCalledWith('/api/users/1', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ name: 'Patched' }),
      headers: expect.objectContaining({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }),
    }));
  });

  it('appends params to the url with body', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ ok: true }),
    });

    await http('/api/users/1').patch({
      params: { notify: false },
      body: { name: 'Patched' },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/users/1?notify=false',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ name: 'Patched' }),
      }),
    );
    expect(fetchMock.mock.calls[0]?.[1]).not.toHaveProperty('params');
  });

  it('passes FormData through without json content-type', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ ok: true }),
    });
    const formData = new FormData();
    formData.append('file', 'value');

    await http('/api/upload').patch({ body: formData });

    expect(fetchMock).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
      method: 'PATCH',
      body: formData,
      headers: expect.objectContaining({
        Accept: 'application/json',
      }),
    }));
    expect(fetchMock.mock.calls[0]?.[1]?.headers).not.toHaveProperty('Content-Type');
  });

  it('passes Blob through without stringifying', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ ok: true }),
    });
    const blob = new Blob(['hello'], { type: 'text/plain' });

    await http('/api/upload').patch({
      body: blob,
      headers: { 'Content-Type': 'text/plain' },
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
      method: 'PATCH',
      body: blob,
      headers: expect.objectContaining({
        'Accept': 'application/json',
        'Content-Type': 'text/plain',
      }),
    }));
  });
});
