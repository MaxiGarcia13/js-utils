# @maxigarcia/js-utils

A small collection of reusable JavaScript and TypeScript utility functions for common frontend tasks.

## Purpose

This project provides lightweight helpers for:

- building class name strings safely
- debouncing function calls
- encoding and decoding text values
- reading and updating URL query parameters in the browser

The goal is to keep these helpers in one package so they can be reused across apps without repeating boilerplate.

## Included Utilities

- `cn(...classes)`
  Joins valid class values into a single class name string.

- `debounce(fn, delay)`
  Returns a debounced version of a function.

- `encodeText(value)` and `decodeText(value)`
  Converts text to and from Base64.

- `getUrlParams()`, `getUrlParam(key)`, `setUrlParams(params)`, `removeUrlParam(key)`
  Helpers for working with URL search params using browser APIs.

## Installation

```bash
npm install @maxigarcia/js-utils
```

## Usage

```ts
import {
  cn,
  debounce,
  decodeText,
  encodeText,
  getUrlParam,
  setUrlParams,
} from '@maxigarcia/js-utils';

const className = cn('btn', true && 'btn-primary', false && 'hidden');
const onResize = debounce(() => console.log('resized'), 300);
const encoded = encodeText('hello');
const decoded = decodeText(encoded);

console.log(className, decoded, getUrlParam('page'));
setUrlParams({ page: '2' });
```

## Development

```bash
npm install
npm run lint
npm test
npm run build
```
