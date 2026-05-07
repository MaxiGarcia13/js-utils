import { expect, it } from 'vitest';
import { decodeText, encodeText } from './text-decoder';

const text = 'Hello, world!';
const expectedEncoded = 'SGVsbG8sIHdvcmxkIQ==';

it('encodeText', () => {
  const encoded = encodeText(text);
  expect(encoded).toBe(expectedEncoded);
});

it('decodeText', () => {
  const decoded = decodeText(expectedEncoded);
  expect(decoded).toBe(text);
});
