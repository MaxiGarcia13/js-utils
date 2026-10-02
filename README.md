# @maxigarcia/js-utils

A small, dependency-free JavaScript/TypeScript utility library for everyday frontend work: arrays, class names, debouncing, deep comparison, storage, text encoding, URL handling, and object helpers. Published as an ES module with TypeScript types.

## What it is

`@maxigarcia/js-utils` bundles helpers you often copy between projects—things like joining conditional CSS classes, debouncing handlers, namespaced `localStorage`, or reading query strings from the current page. Each function lives in its own module, is tree-shakeable via the package entry point, and ships with Vitest coverage.

The package targets **browser and Node** environments where the relevant APIs exist (`window`, `URL`, `Storage`, `TextEncoder`, `btoa`/`atob`, etc.). URL helpers that read or mutate the current page default to `window.location.href` when no URL is passed.

## Install

```bash
npm install @maxigarcia/js-utils
```

## Quick start

```ts
import {
  addParamsToUrl,
  cn,
  createStorage,
  debounce,
  decodeText,
  deepEqual,
  encodeText,
  getParamFromUrl,
  tryParseJson,
  uniqueBy,
} from '@maxigarcia/js-utils';

const className = cn('btn', isActive && 'btn-active', null, 'w-full');
const onResize = debounce(() => console.log('resized'), 300);
const same = deepEqual({ a: [1] }, { a: [1] });
const users = uniqueBy([{ id: 1 }, { id: 2 }, { id: 1 }], 'id');

const token = encodeText('hello'); // Base64 (UTF-8 safe)
const page = getParamFromUrl('page');
const nextUrl = addParamsToUrl('https://example.com', { page: 2, q: 'hello' });

const preferences = createStorage<{ theme: string }>('preferences');
preferences.setJson({ theme: 'dark' });

const data = tryParseJson(`{ name: "Ada", tags: ["js"], }`); // lenient parse
```

## API

### Arrays — `uniqueBy`

Returns a new array with the first occurrence of each item kept, keyed by `key`. Values are compared with `deepEqual`, so object and array keys work.

```ts
uniqueBy([{ id: 1 }, { id: 2 }, { id: 1 }], 'id');
// → [{ id: 1 }, { id: 2 }]
```

### Classes — `cn`

Joins truthy class fragments into one string. Falsy values (`false`, `null`, `undefined`, `0`, `''`) are dropped; booleans used as flags are ignored.

```ts
cn('card', isOpen && 'card--open', disabled && 'card--disabled');
// → "card card--open"
```

### Timing — `debounce`

Returns a debounced wrapper that delays calling `fn` until `delay` ms have passed without another invocation.

```ts
const save = debounce((value: string) => persist(value), 500);
```

### Equality — `deepEqual`

Recursively compares two values. Arrays are compared by length and element; plain objects by own keys and values. Primitives use `===`.

```ts
deepEqual({ x: [1, { y: 2 }] }, { x: [1, { y: 2 }] }); // true
```

### Storage — `createStorage`

Creates a namespaced helper around `localStorage` (or any `Storage`). Keys are prefixed as `app-storage-${name}`.

```ts
const userStorage = createStorage<{ id: number; name: string }>('user');

userStorage.setJson({ id: 1, name: 'Ada' });
userStorage.getJson(); // → { id: 1, name: 'Ada' }

userStorage.setItem('raw-string');
userStorage.getItem(); // → "raw-string"

userStorage.removeItem();
userStorage.clear();
```

| Method           | Description                                    |
| ---------------- | ---------------------------------------------- |
| `getItem()`      | Reads the namespaced string value, or `null`.  |
| `setItem(value)` | Writes a string value.                         |
| `removeItem()`   | Removes the namespaced key.                    |
| `clear()`        | Clears the underlying storage entirely.        |
| `getJson()`      | Parses and returns the stored JSON, or `null`. |
| `setJson(value)` | Stringifies and stores a typed value.          |

### Text — `encodeText` / `decodeText`

Encodes and decodes strings with **UTF-8** via `TextEncoder` / `TextDecoder` and Base64 (`btoa` / `atob`), so non-ASCII text round-trips correctly.

### Strings

| Function                      | Description                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| `capitalize(value)`           | Uppercases the first character and lowercases the rest. Empty strings are returned unchanged. |
| `unwrapString(value)`         | Strips one or more layers of surrounding single or double quotes.                             |
| `removeTrailingCommas(value)` | Removes trailing commas before `}` or `]` in a string (useful before JSON parsing).           |

### Objects

| Function                        | Description                                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `isRecord(value)`               | Type guard: plain object (not `null`, not an array).                                                                                  |
| `getNestedValue(obj, path)`     | Reads a dot-separated path (e.g. `"user.address.city"`).                                                                              |
| `toFlatObject(obj, parentKey?)` | Flattens nested objects into dot-notation keys.                                                                                       |
| `tryParseJson(value)`           | Parses JSON after normalizing unquoted keys, unwrapping quoted strings, and removing trailing commas. Returns `undefined` on failure. |

### URLs

Helpers that read or mutate the current page accept an optional `url` string; if omitted, they use `window.location.href`.

| Function                           | Description                                                                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getParamsFromUrl(url?)`           | Returns a `URLSearchParams` instance for the URL’s query string.                                                                                  |
| `getParamFromUrl(key, url?)`       | Gets one decoded query param, or `null` if missing.                                                                                               |
| `addParamsToUrl(baseUrl, params?)` | Appends query params to `baseUrl`. Values may be `string`, `number`, `boolean`, `null`, or `undefined`; empty / `null` / `undefined` are skipped. |
| `pushParamsToUrl(url)`             | Calls `history.pushState` with the given URL (updates the address bar).                                                                           |
| `removeParamFromUrl(key, url?)`    | Deletes one query param; returns the updated URL string.                                                                                          |
| `isValidHttpUrl(url)`              | `true` if the string is a valid `http:` or `https:` URL.                                                                                          |
| `getUrlDomain(url)`                | Returns the hostname, or `null` if the URL is invalid.                                                                                            |

Example:

```ts
import { addParamsToUrl, pushParamsToUrl } from '@maxigarcia/js-utils';

const url = addParamsToUrl('https://example.com/settings', {
  tab: 'profile',
  page: 1,
  draft: null, // omitted
});
// → "https://example.com/settings?tab=profile&page=1"

pushParamsToUrl(url);
```

## Development

```bash
npm install
npm run lint
npm test
npm run build
```

Build output goes to `dist/` and is what gets published (`exports` point at `./dist/index.js` and `./dist/index.d.ts`).

## License

ISC — see [package.json](./package.json).
