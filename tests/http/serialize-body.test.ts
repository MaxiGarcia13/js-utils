import { describe, expect, it } from 'vitest';
import { serializeBodyOptions } from '../../src/http/serialize-body.js';

describe('serializeBodyOptions', () => {
  it('returns empty headers when options are empty', () => {
    expect(serializeBodyOptions()).toEqual({ headers: {} });
  });

  it('stringifies plain objects and sets json content-type', () => {
    expect(serializeBodyOptions({ body: { name: 'Max' } })).toEqual({
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Max' }),
    });
  });

  it('stringifies arrays and sets json content-type', () => {
    expect(serializeBodyOptions({ body: [1, 2, 3] })).toEqual({
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([1, 2, 3]),
    });
  });

  it('passes string bodies through and sets json content-type', () => {
    const body = JSON.stringify({ already: true });

    expect(serializeBodyOptions({ body })).toEqual({
      headers: { 'Content-Type': 'application/json' },
      body,
    });
  });

  it('passes FormData through without json content-type', () => {
    const body = new FormData();
    body.append('file', 'value');

    expect(serializeBodyOptions({ body })).toEqual({
      headers: {},
      body,
    });
  });

  it('passes Blob through without json content-type', () => {
    const body = new Blob(['hello'], { type: 'text/plain' });

    expect(serializeBodyOptions({ body })).toEqual({
      headers: {},
      body,
    });
  });

  it('passes URLSearchParams through without stringifying', () => {
    const body = new URLSearchParams({ q: 'test' });

    expect(serializeBodyOptions({ body })).toEqual({
      headers: {},
      body,
    });
  });

  it('merges custom headers over defaults', () => {
    expect(serializeBodyOptions({
      body: { id: 1 },
      headers: { 'Authorization': 'Bearer token', 'Content-Type': 'application/vnd.api+json' },
    })).toEqual({
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Authorization': 'Bearer token',
      },
      body: JSON.stringify({ id: 1 }),
    });
  });

  it('accepts Headers instances', () => {
    const headers = new Headers({ Authorization: 'Bearer token' });

    expect(serializeBodyOptions({ body: { id: 1 }, headers })).toEqual({
      headers: {
        'Content-Type': 'application/json',
        'authorization': 'Bearer token',
      },
      body: JSON.stringify({ id: 1 }),
    });
  });

  it('accepts header entries arrays', () => {
    expect(serializeBodyOptions({
      body: { id: 1 },
      headers: [['Authorization', 'Bearer token']],
    })).toEqual({
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token',
      },
      body: JSON.stringify({ id: 1 }),
    });
  });

  it('preserves other request options', () => {
    expect(serializeBodyOptions({
      body: { ok: true },
      credentials: 'include',
      mode: 'cors',
    })).toEqual({
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
      credentials: 'include',
      mode: 'cors',
    });
  });
});
