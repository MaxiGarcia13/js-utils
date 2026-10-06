import { afterEach, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

export function mockFetch(
  res: Partial<Response> & {
    json?: () => Promise<unknown>;
    text?: () => Promise<string>;
  } = {},
) {
  const jsonFn = res.json ?? (async () => ({}));
  const textFn = res.text ?? (async () => {
    const data = await jsonFn();
    return data === undefined ? '' : JSON.stringify(data);
  });

  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    ...res,
    json: jsonFn,
    text: textFn,
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
