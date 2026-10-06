import { afterEach, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function createHeaders(init?: HeadersInit): Headers {
  if (init === undefined) {
    return new Headers({ 'content-type': 'application/json' });
  }

  return new Headers(init);
}

export function mockFetch(
  res: Omit<Partial<Response>, 'headers' | 'json' | 'text'> & {
    json?: () => Promise<unknown>;
    text?: () => Promise<string>;
    headers?: HeadersInit;
  } = {},
) {
  const jsonFn = res.json ?? (async () => ({}));
  const textFn = res.text ?? (async () => {
    const data = await jsonFn();
    return data === undefined ? '' : JSON.stringify(data);
  });

  const { headers: headersInit, ...rest } = res;

  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    ...rest,
    headers: createHeaders(headersInit),
    json: jsonFn,
    text: textFn,
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
