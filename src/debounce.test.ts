import { expect, it, vi } from 'vitest';
import { debounce } from './debounce.js';

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

it('debounce resolves with fn result', async () => {
  vi.useFakeTimers();

  const delay = 100;
  const fn = vi.fn((value: string) => value.toUpperCase());
  const debouncedFn = debounce(fn, delay);

  const promise = debouncedFn('hello');

  expect(fn).toHaveBeenCalledTimes(0);

  vi.advanceTimersByTime(delay);

  await expect(promise).resolves.toBe('HELLO');
  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith('hello');
});

it('debounce flattens promise return type', async () => {
  vi.useFakeTimers();

  const delay = 100;
  const fn = vi.fn(async (value: string) => value.toUpperCase());
  const debouncedFn = debounce(fn, delay);

  const promise = debouncedFn('hello');

  expect(fn).toHaveBeenCalledTimes(0);

  vi.advanceTimersByTime(delay);

  await expect(promise).resolves.toBe('HELLO');
  expect(fn).toHaveBeenCalledTimes(1);
});
