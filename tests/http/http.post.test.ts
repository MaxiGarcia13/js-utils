import { describe, expect, it } from 'vitest';
import { http } from '../../src/http/http.js';
import { mockFetch } from './http.utils.js';

describe('http.post', () => {
  it('sends json body with POST method', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ id: 2, name: 'Max' }),
    });

    await expect(http('/api/users').post({
      body: { name: 'Max' },
    })).resolves.toEqual({ id: 2, name: 'Max' });

    expect(fetchMock).toHaveBeenCalledWith('/api/users', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ name: 'Max' }),
      headers: expect.objectContaining({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }),
    }));
  });

  it('appends params to the url with body', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ id: 3 }),
    });

    await expect(http('/api/users').post({
      params: { dryRun: true },
      body: { name: 'Max' },
    })).resolves.toEqual({ id: 3 });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/users?dryRun=true',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Max' }),
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

    await http('/api/upload').post({ body: formData });

    expect(fetchMock).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
      method: 'POST',
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

    await http('/api/upload').post({
      body: blob,
      headers: { 'Content-Type': 'text/plain' },
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
      method: 'POST',
      body: blob,
      headers: expect.objectContaining({
        'Accept': 'application/json',
        'Content-Type': 'text/plain',
      }),
    }));
  });
});
