import { describe, expect, it } from 'vitest';
import { uniqueBy } from './array';

describe('uniqueBy', () => {
  it('should return unique items by key', () => {
    const array = [{ id: 1 }, { id: 2 }, { id: 1 }];
    const result = uniqueBy(array, 'id');

    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('should keep the first occurrence of each key', () => {
    const array = [
      { id: 1, name: 'first' },
      { id: 2, name: 'second' },
      { id: 1, name: 'duplicate' },
    ];

    expect(uniqueBy(array, 'id')).toEqual([
      { id: 1, name: 'first' },
      { id: 2, name: 'second' },
    ]);
  });

  it('should return an empty array when given an empty array', () => {
    expect(uniqueBy([], 'id')).toEqual([]);
  });

  it('should return the same items when all keys are unique', () => {
    const array = [{ id: 1 }, { id: 2 }, { id: 3 }];

    expect(uniqueBy(array, 'id')).toEqual(array);
  });

  it('should unique by a string key', () => {
    const array = [
      { type: 'a', value: 1 },
      { type: 'b', value: 2 },
      { type: 'a', value: 3 },
    ];

    expect(uniqueBy(array, 'type')).toEqual([
      { type: 'a', value: 1 },
      { type: 'b', value: 2 },
    ]);
  });

  it('should unique by nested object keys using deep equality', () => {
    const array = [
      { meta: { id: 1 }, name: 'first' },
      { meta: { id: 2 }, name: 'second' },
      { meta: { id: 1 }, name: 'duplicate' },
    ];

    expect(uniqueBy(array, 'meta')).toEqual([
      { meta: { id: 1 }, name: 'first' },
      { meta: { id: 2 }, name: 'second' },
    ]);
  });

  it('should unique by array keys using deep equality', () => {
    const array = [
      { tags: ['a', 'b'], name: 'first' },
      { tags: ['c'], name: 'second' },
      { tags: ['a', 'b'], name: 'duplicate' },
    ];

    expect(uniqueBy(array, 'tags')).toEqual([
      { tags: ['a', 'b'], name: 'first' },
      { tags: ['c'], name: 'second' },
    ]);
  });
});
