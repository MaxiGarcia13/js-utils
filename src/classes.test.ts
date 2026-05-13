import { expect, it } from 'vitest';
import { cn } from './classes.js';

it('cn', () => {
  expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz');
  expect(cn('foo', 'bar', 'baz', false)).toBe('foo bar baz');
  expect(cn('foo', 'bar', 'baz', null)).toBe('foo bar baz');
  expect(cn('foo', 'bar', 'baz', undefined)).toBe('foo bar baz');
  expect(cn('foo', 'bar', 'baz', 0)).toBe('foo bar baz');
  expect(cn('foo', 'bar', 'baz', 1)).toBe('foo bar baz 1');
  expect(cn('foo', 'bar', 'baz', true)).toBe('foo bar baz');
});
