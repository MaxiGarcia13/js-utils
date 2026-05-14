import { expect, it } from 'vitest';
import { getFlatObject, getNestedValue, isRecord } from './object.js';

it('isRecord', () => {
  expect(isRecord({})).toBe(true);
  expect(isRecord([])).toBe(true);
  expect(isRecord(null)).toBe(false);
  expect(isRecord(undefined)).toBe(false);
  expect(isRecord(1)).toBe(false);
  expect(isRecord('string')).toBe(false);
  expect(isRecord(true)).toBe(false);
  expect(isRecord(false)).toBe(false);
});

it('getNestedValue', () => {
  expect(getNestedValue(
    { a: { b: 1 } },
    'a',
  )).toEqual({ b: 1 });
  expect(getNestedValue(
    { a: { b: 1 } },
    'a.b',
  )).toBe(1);
  expect(getNestedValue(
    { a: { b: { c: 2 } } },
    'a.b.c',
  )).toBe(2);
  expect(getNestedValue(
    { a: { b: 1 } },
    'a.c',
  )).toBe(undefined);
});

it('getFlatObject', () => {
  expect(
    getFlatObject(
      {
        a: {
          b: 1,
        },
        c: 2,
        d: {
          e: {
            f: 3,
            g: 4,
          },
        },
      },
    ),
  ).toEqual({ 'a.b': 1, 'c': 2, 'd.e.f': 3, 'd.e.g': 4 });
});
