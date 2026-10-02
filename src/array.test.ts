import { describe, expect, it } from 'vitest';
import { uniqueBy } from './array';

describe('uniqueBy', () => {
  it('should return unique items by key', () => {
    const array = [{ id: 1 }, { id: 2 }, { id: 1 }];
    const result = uniqueBy(array, 'id');

    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });
});
