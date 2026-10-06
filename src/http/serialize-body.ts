const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const;

export type JsonBody = Record<string, unknown> | readonly unknown[] | number | boolean | null;

export type BodyOptions = Omit<RequestInit, 'body' | 'method'> & {
  body?: BodyInit | JsonBody;
};

function isJsonBody(body: unknown): body is JsonBody {
  if (body === null || typeof body === 'number' || typeof body === 'boolean') {
    return true;
  }

  if (Array.isArray(body)) {
    return true;
  }

  if (typeof body !== 'object') {
    return false;
  }

  const proto = Object.getPrototypeOf(body);
  return proto === Object.prototype || proto === null;
}

export function serializeBodyOptions(options: BodyOptions = {}): RequestInit {
  const { body, headers, ...rest } = options;
  const jsonBody = isJsonBody(body);

  return {
    ...rest,
    headers: {
      ...(jsonBody || body === undefined || typeof body === 'string'
        ? DEFAULT_HEADERS
        : {}),
      ...headers,
    },
    ...(body !== undefined
      ? { body: jsonBody ? JSON.stringify(body) : body }
      : {}),
  };
}
