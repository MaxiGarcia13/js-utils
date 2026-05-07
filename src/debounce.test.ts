import { expect, it, vi } from 'vitest';
import { debounce } from './debounce';

it('debounce', () => {
  vi.useFakeTimers();

  const delay = 100;

  const fn = vi.fn();

  const debouncedFn = debounce(fn, delay);

  debouncedFn();
  debouncedFn();
  debouncedFn();

  expect(fn).toHaveBeenCalledTimes(0);

  vi.advanceTimersByTime(delay);

  expect(fn).toHaveBeenCalledTimes(1);
});
