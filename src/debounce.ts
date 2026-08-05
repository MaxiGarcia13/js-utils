export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(fn: T, delay: number) {
  let timeout: ReturnType<typeof setTimeout>;

  return function (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    clearTimeout(timeout);

    return new Promise((resolve, reject) => {
      timeout = setTimeout(() => {
        Promise.resolve(fn(...args)).then(resolve, reject);
      }, delay);
    });
  };
}
