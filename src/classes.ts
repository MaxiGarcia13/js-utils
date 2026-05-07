export function cn(...classes: Array<string | boolean | undefined | null | number>) {
  return classes
    .filter((c) => Boolean(c) && typeof c !== 'boolean')
    .join(' ');
}
