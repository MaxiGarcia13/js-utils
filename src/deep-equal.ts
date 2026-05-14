import { isRecord } from './object.js';

export function deepEqual(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length)
      return false;
    return a.every((value, index) => deepEqual(value, b[index]));
  }

  if (isRecord(a) && isRecord(b)) {
    return Object.keys(a).every((key) => deepEqual(a[key], b[key]));
  }

  return a === b;
}
