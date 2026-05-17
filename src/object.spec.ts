import { expect, it } from 'vitest';
import { getNestedValue, isRecord, toFlatObject, tryParseJson } from './object.js';

it('isRecord', () => {
  expect(isRecord({})).toBe(true);
  expect(isRecord([])).toBe(false);
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

it('toFlatObject', () => {
  expect(
    toFlatObject(
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

it('tryParseJson', () => {
  expect(tryParseJson('{"a": 1}')).toEqual({ a: 1 });
  expect(tryParseJson('{a: 1}')).toEqual({ a: 1 });
  expect(tryParseJson('{a: 1, b: 2,}')).toEqual({ a: 1, b: 2 });
  expect(tryParseJson('[1, 2, 3,]')).toEqual([1, 2, 3]);
  expect(tryParseJson('{ nested: { value: true } }')).toEqual({ nested: { value: true } });
  expect(tryParseJson('not json')).toBeUndefined();
});
