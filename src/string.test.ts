import { expect, it } from 'vitest';
import { capitalize, unwrapString } from './string.js';

it('capitalize', () => {
  expect(capitalize('hello')).toBe('Hello');
  expect(capitalize('HELLO')).toBe('Hello');
  expect(capitalize('hELLO')).toBe('Hello');
  expect(capitalize('')).toBe('');
});

it('unwrapString', () => {
  expect(unwrapString('"hello"')).toBe('hello');
  expect(unwrapString('\'hello\'')).toBe('hello');
  expect(unwrapString('hello')).toBe('hello');
  expect(unwrapString(`"hello"`)).toBe('hello');
  expect(unwrapString(`'"hello"'`)).toBe('hello');
});
