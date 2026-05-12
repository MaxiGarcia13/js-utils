import { expect, it } from 'vitest';
import { capitalize } from './string';

it('capitalize', () => {
  expect(capitalize('hello')).toBe('Hello');
  expect(capitalize('HELLO')).toBe('Hello');
  expect(capitalize('hELLO')).toBe('Hello');
  expect(capitalize('')).toBe('');
});
