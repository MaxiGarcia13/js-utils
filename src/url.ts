export function getUrlParams() {
  return new URLSearchParams(window.location.search);
}

export function getUrlParam(key: string) {
  const params = getUrlParams();
  const value = params.get(key);

  if (value) {
    return decodeURIComponent(value);
  }

  return null;
}

export function setUrlParams(params: Record<string, string>) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, encodeURIComponent(value));
  }
  window.history.pushState({}, '', url.toString());
}

export function removeUrlParam(key: string) {
  const url = new URL(window.location.href);
  url.searchParams.delete(key);
  window.history.pushState({}, '', url.toString());
}

export function isValidHttpUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getUrlDomain(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}
