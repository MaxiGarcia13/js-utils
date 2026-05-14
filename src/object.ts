export function getNestedValue<T>(obj: T, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined)
      return undefined;
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

export function getFlatObject<T>(
  obj: T,
  parentKey?: string,
): Record<string, unknown> | T {
  if (!isRecord(obj)) {
    return obj;
  }

  return Object.keys(obj).reduce((acc, key) => {
    const path = parentKey ? `${parentKey}.${key}` : key;
    const value = obj[key];
    const flattened = getFlatObject(value, path);
    if (isRecord(flattened)) {
      return { ...acc, ...flattened };
    }
    return { ...acc, [path]: flattened };
  }, {} as Record<string, unknown>);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
