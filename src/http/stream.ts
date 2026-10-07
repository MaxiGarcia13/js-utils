import type { AbortTracker } from './runners.js';
import type { SseEvent, StreamFormat, StreamOptions } from './types.js';
import { addParamsToUrl } from '../url/index.js';
import { toHeadersRecord } from './headers.js';
import {
  AbortRequestError,
  isAbortError,
  NetworkError,
  throwHttpError,
} from './http-error.js';
import { serializeBodyOptions } from './serialize-body.js';

const ACCEPT_BY_FORMAT: Record<StreamFormat, string> = {
  bytes: '*/*',
  ndjson: 'application/x-ndjson, application/jsonl, application/json',
  sse: 'text/event-stream',
};

export interface StreamMethod {
  (options?: Omit<StreamOptions, 'format'> & { format?: 'bytes' }): AsyncIterable<Uint8Array>;
  <T>(options: Omit<StreamOptions, 'format'> & { format: 'ndjson' }): AsyncIterable<T>;
  (options: Omit<StreamOptions, 'format'> & { format: 'sse' }): AsyncIterable<SseEvent>;
}

function rethrowStreamError(error: unknown): never {
  if (isAbortError(error)) {
    throw new AbortRequestError('Request aborted', { cause: error });
  }
  throw error;
}

async function* readBytes(body: ReadableStream<Uint8Array> | null) {
  if (!body) {
    return;
  }

  try {
    for await (const chunk of body) {
      yield chunk;
    }
  } catch (error) {
    rethrowStreamError(error);
  }
}

async function* readLines(body: ReadableStream<Uint8Array> | null) {
  const decoder = new TextDecoder();
  let buffer = '';

  for await (const chunk of readBytes(body)) {
    buffer += decoder.decode(chunk, { stream: true }).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    yield* lines;
  }

  buffer += decoder.decode();
  if (buffer) {
    yield buffer;
  }
}

async function* parseNdjson<T>(body: ReadableStream<Uint8Array> | null) {
  for await (const line of readLines(body)) {
    if (line) {
      yield JSON.parse(line) as T;
    }
  }
}

async function* parseSse(body: ReadableStream<Uint8Array> | null) {
  let event: SseEvent = { data: '' };
  let dataLines: string[] = [];

  const flush = (): SseEvent | null => {
    if (!dataLines.length && event.event === undefined && event.id === undefined && event.retry === undefined) {
      return null;
    }
    const next = { ...event, data: dataLines.join('\n') };
    event = { data: '' };
    dataLines = [];
    return next;
  };

  for await (const line of readLines(body)) {
    if (!line) {
      const next = flush();
      if (next) {
        yield next;
      }
      continue;
    }

    if (line.startsWith(':')) {
      continue;
    }

    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? '' : line.slice(colon + 1);
    if (value.startsWith(' ')) {
      value = value.slice(1);
    }

    if (field === 'event') {
      event.event = value;
    } else if (field === 'data') {
      dataLines.push(value);
    } else if (field === 'id') {
      event.id = value;
    } else if (field === 'retry') {
      const retry = Number(value);
      if (!Number.isNaN(retry)) {
        event.retry = retry;
      }
    }
  }

  const next = flush();
  if (next) {
    yield next;
  }
}

export function createHttpStream(url: string, { begin, release }: AbortTracker): StreamMethod {
  return ((options: StreamOptions = {}) => {
    const { format = 'bytes', method = 'GET', ...rest } = options;
    const { params, ...requestInit } = serializeBodyOptions(rest);
    const finalUrl = addParamsToUrl(url, params);

    const key = `${method}:${finalUrl}`;
    const controller = begin(key);

    return (async function* () {
      try {
        let res: Response;

        try {
          res = await fetch(finalUrl, {
            ...requestInit,
            method,
            signal: controller.signal,
            headers: {
              Accept: ACCEPT_BY_FORMAT[format],
              ...toHeadersRecord(requestInit.headers),
            },
          });
        } catch (error) {
          if (isAbortError(error)) {
            throw new AbortRequestError('Request aborted', { cause: error });
          }
          throw new NetworkError('Network request failed', { cause: error });
        }

        if (!res.ok) {
          await throwHttpError(res);
        }

        if (format === 'ndjson') {
          yield* parseNdjson(res.body);
          return;
        }

        if (format === 'sse') {
          yield* parseSse(res.body);
          return;
        }

        yield* readBytes(res.body);
      } finally {
        release(key, controller);
      }
    })();
  }) as StreamMethod;
}
