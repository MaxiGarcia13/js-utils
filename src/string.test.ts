import { expect, it } from 'vitest';
import { capitalize, removeTrailingCommas, unwrapString } from './string.js';

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

it('removeTrailingCommas', () => {
  expect(removeTrailingCommas('{a: 1, b: 2,}')).toBe('{a: 1, b: 2}');
  expect(removeTrailingCommas('[1, 2, 3,]')).toBe('[1, 2, 3]');
  expect(removeTrailingCommas('[1, 2, 3]')).toBe('[1, 2, 3]');
  expect(removeTrailingCommas('{a: 1, b: 2}')).toBe('{a: 1, b: 2}');
});
