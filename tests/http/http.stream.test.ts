import { afterEach, describe, expect, it, vi } from 'vitest';
import { http } from '../../src/http/http.js';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function collect<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const items: T[] = [];
  for await (const item of iterable) {
    items.push(item);
  }
  return items;
}

function mockStreamFetch(
  chunks: Array<string | Uint8Array>,
  init: {
    ok?: boolean;
    status?: number;
    statusText?: string;
    headers?: HeadersInit;
    json?: () => Promise<unknown>;
  } = {},
) {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(typeof chunk === 'string' ? encoder.encode(chunk) : chunk);
      }
      controller.close();
    },
  });

  const fetchMock = vi.fn(async () => ({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: init.statusText ?? 'OK',
    headers: new Headers(init.headers ?? {}),
    body,
    json: init.json ?? (async () => ({})),
  }));

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('http.stream', () => {
  it('yields raw bytes by default', async () => {
    const fetchMock = mockStreamFetch(['hello', ' world']);

    const chunks = await collect(http('/api/file').stream());
    const text = new TextDecoder().decode(
      chunks.reduce((acc, chunk) => {
        const next = new Uint8Array(acc.length + chunk.length);
        next.set(acc);
        next.set(chunk, acc.length);
        return next;
      }, new Uint8Array()),
    );

    expect(text).toBe('hello world');
    expect(fetchMock).toHaveBeenCalledWith('/api/file', expect.objectContaining({
      method: 'GET',
      signal: expect.any(AbortSignal),
      headers: expect.objectContaining({
        Accept: '*/*',
      }),
    }));
  });

  it('parses ndjson lines', async () => {
    mockStreamFetch(['{"id":1}\n', '{"id":2}\n{"id":3}\n']);

    await expect(
      collect(http('/api/items').stream<{ id: number }>({ format: 'ndjson' })),
    ).resolves.toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });

  it('parses sse events', async () => {
    mockStreamFetch([
      'event: message\ndata: hello\nid: 1\n\n',
      ': comment\ndata: multi\ndata: line\nretry: 3000\n\n',
    ]);

    await expect(
      collect(http('/api/events').stream({ format: 'sse' })),
    ).resolves.toEqual([
      { event: 'message', data: 'hello', id: '1' },
      { data: 'multi\nline', retry: 3000 },
    ]);
  });

  it('throws HttpError when response is not ok', async () => {
    mockStreamFetch([], {
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: async () => ({ message: 'boom' }),
    });

    await expect(collect(http('/api/events').stream())).rejects.toMatchObject({
      name: 'HttpError',
      status: 500,
      message: 'boom',
    });
  });

  it('aborts the previous stream when called again with the same url and method', async () => {
    const signals: AbortSignal[] = [];

    vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => {
      signals.push(init!.signal!);
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('x'));
            controller.close();
          },
        }),
      };
    }));

    const client = http('/api/events');
    const first = collect(client.stream());
    const second = collect(client.stream());

    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);

    await first.catch(() => undefined);
    await second;
  });

  it('supports post body for streams', async () => {
    const fetchMock = mockStreamFetch(['data: ok\n\n']);

    await collect(http('/api/chat').stream({
      format: 'sse',
      method: 'POST',
      body: { prompt: 'hi' },
    }));

    expect(fetchMock).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ prompt: 'hi' }),
      headers: expect.objectContaining({
        'Accept': 'text/event-stream',
        'Content-Type': 'application/json',
      }),
    }));
  });
});
