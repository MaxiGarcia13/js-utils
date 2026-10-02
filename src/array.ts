import { deepEqual } from './deep-equal.js';

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  return array.filter((item, index, self) =>
    index === self.findIndex((t) => deepEqual(t[key], item[key])),
  );
}
