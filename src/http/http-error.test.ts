import { describe, expect, it } from 'vitest';
import { HttpError, isHttpError, throwHttpError } from './http-error.js';

describe('isHttpError', () => {
  it('returns true for HttpError instances', () => {
    expect(isHttpError(new HttpError(404, 'Not found'))).toBe(true);
  });

  it('returns true for objects with status and message', () => {
    expect(isHttpError({ status: 500, message: 'Server error' })).toBe(true);
  });

  it('returns false for unrelated values', () => {
    expect(isHttpError(null)).toBe(false);
    expect(isHttpError('error')).toBe(false);
    expect(isHttpError({ message: 'missing status' })).toBe(false);
    expect(isHttpError({ status: 400 })).toBe(false);
  });
});

describe('throwHttpError', () => {
  it('throws HttpError with body message when body has status and message', async () => {
    const res = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ status: 404, message: 'User not found' }),
    } as Response;

    await expect(throwHttpError(res)).rejects.toMatchObject({
      name: 'HttpError',
      status: 404,
      message: 'User not found',
    });
  });

  it('throws HttpError with statusText when body is not an http error shape', async () => {
    const res = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'boom' }),
    } as Response;

    await expect(throwHttpError(res)).rejects.toMatchObject({
      name: 'HttpError',
      status: 500,
      message: 'Internal Server Error',
    });
  });

  it('falls back to HTTP status when statusText is empty and body is invalid', async () => {
    const res = {
      ok: false,
      status: 502,
      statusText: '',
      json: async () => {
        throw new Error('invalid json');
      },
    } as unknown as Response;

    await expect(throwHttpError(res)).rejects.toMatchObject({
      name: 'HttpError',
      status: 502,
      message: 'HTTP 502',
    });
  });
});
