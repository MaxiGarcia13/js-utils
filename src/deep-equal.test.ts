import { describe, expect, it } from 'vitest';
import { deepEqual } from './deep-equal.js';

describe('deepEqual', () => {
  describe('primitives', () => {
    const primitives = [1, 'hello', true, false, null, undefined];
    const otherPrimitives = [2, 'world', false, true, undefined, null];

    it('should return true if the primitives are equal', () => {
      for (const primitive of primitives) {
        expect(deepEqual(primitive, primitive)).toBe(true);
      }
    });

    it('should return false if the primitives are not equal', () => {
      for (let i = 0; i < primitives.length; i++) {
        expect(deepEqual(primitives[i], otherPrimitives[i])).toBe(false);
      }
    });
  });

  describe('objects', () => {
    it('should return true if the objects are equal', () => {
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    });

    it('should return false if the objects are not equal', () => {
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
    });
  });

  describe('arrays', () => {
    it('should return true if the arrays are equal', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it('should return false if the arrays are not equal', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });
  });

  describe('null and undefined', () => {
    it('should return true if the nulls are equal', () => {
      expect(deepEqual(null, null)).toBe(true);
    });

    it('should return false if the nulls are not equal', () => {
      expect(deepEqual(null, undefined)).toBe(false);
    });
  });
});
