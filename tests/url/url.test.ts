import { expect, it, vi } from 'vitest';
import {
  addParamsToUrl,
  getParamFromUrl,
  getParamsFromUrl,
  getUrlDomain,
  isValidHttpUrl,
  pushParamsToUrl,
  removeParamFromUrl,
} from '../../src/url/url';

it('getParamsFromUrl', () => {
  const params = getParamsFromUrl('https://example.com?foo=bar&baz=qux');

  expect(params.get('foo')).toBe('bar');
  expect(params.get('baz')).toBe('qux');
});

it('getParamFromUrl', () => {
  const param = getParamFromUrl('foo', 'https://example.com?foo=bar&baz=qux');

  expect(param).toBe('bar');
});

it('addParamsToUrl', () => {
  expect(addParamsToUrl('https://example.com/', { foo: 'bar' })).toBe(
    'https://example.com/?foo=bar',
  );

  expect(
    addParamsToUrl('https://example.com/?method=UE9TVA%3D%3D', {
      url: 'aHR0cHM6Ly9leGFtcGxlLnRlc3QvYXBp',
    }),
  ).toBe(
    'https://example.com/?method=UE9TVA%3D%3D&url=aHR0cHM6Ly9leGFtcGxlLnRlc3QvYXBp',
  );

  expect(addParamsToUrl('https://example.com/?foo=old', { foo: 'new' })).toBe(
    'https://example.com/?foo=new',
  );

  expect(addParamsToUrl('/api/users', { page: 1, q: 'max' })).toBe(
    '/api/users?page=1&q=max',
  );

  expect(addParamsToUrl('/api/users?page=1', { q: 'max' })).toBe(
    '/api/users?page=1&q=max',
  );

  expect(
    addParamsToUrl('https://example.com/', {
      foo: 'qux',
      baz: 'qux',
      qux: null,
      quux: undefined,
      empty: '',
      blank: '   ',
      corge: 0,
      grault: 1,
      garply: true,
      waldo: false,
      fred: 'string',
    }),
  ).toBe(
    'https://example.com/?foo=qux&baz=qux&corge=0&grault=1&garply=true&waldo=false&fred=string',
  );
});

it('removeParamFromUrl', () => {
  const url = removeParamFromUrl('foo', 'https://example.com?foo=bar');

  expect(url).toBe('https://example.com/');
});

it('pushParamsToUrl', () => {
  const pushState = vi.fn();

  vi.stubGlobal('window', {
    history: { pushState },
  });

  pushParamsToUrl('https://example.com/?foo=bar');

  expect(pushState).toHaveBeenCalledWith({}, '', 'https://example.com/?foo=bar');
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
