export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(fn: T, delay: number) {
  let timeout: ReturnType<typeof setTimeout>;

  return function (...args: Parameters<T>) {
    clearTimeout(timeout);

    return new Promise<ReturnType<T>>((resolve) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => resolve(fn(...args)), delay);
    });
  };
}
