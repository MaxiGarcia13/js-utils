import { describe, expect, it } from 'vitest';
import { http } from './http.js';
import { mockFetch } from './http.utils.test.js';

describe('http.put', () => {
  it('sends json body with PUT method', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ id: 1, name: 'Updated' }),
    });

    await expect(http('/api/users/1').put({
      body: { name: 'Updated' },
    })).resolves.toEqual({ id: 1, name: 'Updated' });

    expect(fetchMock).toHaveBeenCalledWith('/api/users/1', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated' }),
      headers: { 'Content-Type': 'application/json' },
    }));
  });

  it('appends params to the url with body', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ ok: true }),
    });

    await http('/api/users/1').put({
      params: { notify: false },
      body: { name: 'Updated' },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/users/1?notify=false',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
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

    await http('/api/upload').put({ body: formData });

    expect(fetchMock).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
      method: 'PUT',
      body: formData,
      headers: {},
    }));
  });

  it('passes Blob through without stringifying', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ ok: true }),
    });
    const blob = new Blob(['hello'], { type: 'text/plain' });

    await http('/api/upload').put({
      body: blob,
      headers: { 'Content-Type': 'text/plain' },
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': 'text/plain' },
    }));
  });
});
