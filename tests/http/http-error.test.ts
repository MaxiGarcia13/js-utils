import { describe, expect, it } from 'vitest';
import {
  AbortRequestError,
  HttpError,
  isAbortRequestError,
  isHttpError,
  isNetworkError,
  NetworkError,
  throwHttpError,
} from '../../src/http/http-error.js';

describe('isHttpError', () => {
  it('returns true for HttpError instances', () => {
    expect(isHttpError(new HttpError(404, 'Not found'))).toBe(true);
  });

  it('returns false for plain objects with status and message', () => {
    expect(isHttpError({ status: 500, message: 'Server error' })).toBe(false);
  });

  it('returns false for unrelated values', () => {
    expect(isHttpError(null)).toBe(false);
    expect(isHttpError('error')).toBe(false);
    expect(isHttpError({ message: 'missing status' })).toBe(false);
    expect(isHttpError({ status: 400 })).toBe(false);
    expect(isHttpError(new NetworkError())).toBe(false);
    expect(isHttpError(new AbortRequestError())).toBe(false);
  });
});

describe('isNetworkError', () => {
  it('returns true for NetworkError instances', () => {
    expect(isNetworkError(new NetworkError())).toBe(true);
  });

  it('returns false for other errors', () => {
    expect(isNetworkError(new HttpError(500, 'fail'))).toBe(false);
    expect(isNetworkError(new AbortRequestError())).toBe(false);
  });
});

describe('isAbortRequestError', () => {
  it('returns true for AbortRequestError instances', () => {
    expect(isAbortRequestError(new AbortRequestError())).toBe(true);
  });

  it('returns false for other errors', () => {
    expect(isAbortRequestError(new HttpError(500, 'fail'))).toBe(false);
    expect(isAbortRequestError(new NetworkError())).toBe(false);
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

  it('throws HttpError with body message when body only has message', async () => {
    const res = {
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ message: 'Invalid email' }),
    } as Response;

    await expect(throwHttpError(res)).rejects.toMatchObject({
      name: 'HttpError',
      status: 400,
      message: 'Invalid email',
    });
  });

  it('throws HttpError with statusText when body has no message', async () => {
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
