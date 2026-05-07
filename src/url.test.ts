import { expect, it, vi } from 'vitest';
import { getUrlParam, getUrlParams, removeUrlParam, setUrlParams } from './url';

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
