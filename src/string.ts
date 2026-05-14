export function capitalize(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function unwrapString(value: string) {
  let unwrapped = value;
  while (/^['"].*['"]$/.test(unwrapped)) unwrapped = unwrapped.slice(1, -1);
  return unwrapped;
}

export function removeTrailingCommas(value: string) {
  return value
    .replace(/,\s*\}/g, '}') // remove commas before }
    .replace(/,\s*\]/g, ']'); // remove commas before ]
}
