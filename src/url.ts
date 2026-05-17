export function getParamsFromUrl(url: string = window.location.href) {
  return new URLSearchParams(new URL(url).search);
}

export function getParamFromUrl(key: string, url: string = window.location.href) {
  const params = getParamsFromUrl(url);

  const value = params.get(key);

  if (value) {
    return decodeURIComponent(value);
  }

  return null;
}

export function addParamsToUrl(params: Record<string, string>, url: string = window.location.href) {
  const urlObject = new URL(url);

  for (const [key, value] of Object.entries(params)) {
    urlObject.searchParams.set(key, encodeURIComponent(value));
  }

  return urlObject.toString();
}

export function pushParamsToUrl(url: string) {
  window.history.pushState({}, '', url);
}

export function removeParamFromUrl(key: string, url: string = window.location.href) {
  const urlObject = new URL(url);

  urlObject.searchParams.delete(key);

  return urlObject.toString();
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
