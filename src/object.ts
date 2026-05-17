import { removeTrailingCommas, unwrapString } from './string.js';

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

export function toFlatObject<T>(
  obj: T,
  parentKey?: string,
): Record<string, unknown> | T {
  if (!isRecord(obj)) {
    return obj;
  }

  return Object.keys(obj).reduce((acc, key) => {
    const path = parentKey ? `${parentKey}.${key}` : key;
    const value = obj[key];
    const flattened = toFlatObject(value, path);
    if (isRecord(flattened)) {
      return { ...acc, ...flattened };
    }
    return { ...acc, [path]: flattened };
  }, {} as Record<string, unknown>);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function tryParseJson(value: string): unknown | undefined {
  try {
    const fixed = value.replace(
      /([{,]\s*)([a-z_$][\w$]*)(\s*:)/gi,
      '$1"$2"$3',
    );
    const unwrapped = unwrapString(fixed);
    const removedTrailingCommas = removeTrailingCommas(unwrapped);

    return JSON.parse(removedTrailingCommas);
  } catch {
    return undefined;
  }
}
