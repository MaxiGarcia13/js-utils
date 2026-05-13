import { expect, it, vi } from 'vitest';
import { getUrlDomain, getUrlParam, getUrlParams, isValidHttpUrl, removeUrlParam, setUrlParams } from './url.js';

it('getUrlParams', () => {
  const search = 'foo=bar&baz=qux';

  vi.stubGlobal('window', {
    location: {
      search,
    },
  });

  const params = getUrlParams();

  expect(params).toEqual(new URLSearchParams(search));
});

it('getUrlParam', () => {
  vi.stubGlobal('window', {
    location: {
      search: 'foo=bar&baz=qux',
    },
  });

  const param = getUrlParam('foo');
  expect(param).toBe('bar');
});

it('setUrlParams', () => {
  vi.stubGlobal('window', {
    location: {
      href: 'https://example.com',
    },
    history: {
      pushState: vi.fn((_, __, url: string) => {
        window.location.href = url;
      }),
    },
  });

  setUrlParams({ foo: 'qux', baz: 'qux' });

  expect(window.location.href).toBe('https://example.com/?foo=qux&baz=qux');
});

it('removeUrlParam', () => {
  vi.stubGlobal('window', {
    location: {
      href: 'https://example.com',
    },
    history: {
      pushState: vi.fn((_, __, url: string) => {
        window.location.href = url;
      }),
    },
  });

  removeUrlParam('foo');
  expect(window.location.href).toBe('https://example.com/');
});

it('isValidHttpUrl', () => {
  expect(isValidHttpUrl('https://example.com')).toBe(true);
  expect(isValidHttpUrl('http://example.com/path?foo=bar')).toBe(true);
  expect(isValidHttpUrl('ftp://example.com')).toBe(false);
  expect(isValidHttpUrl('example.com')).toBe(false);
});

it('getUrlDomain', () => {
  expect(getUrlDomain('https://example.com/path')).toBe('example.com');
  expect(getUrlDomain('https://sub.example.com/path')).toBe('sub.example.com');
  expect(getUrlDomain('not a valid url')).toBeNull();
});
