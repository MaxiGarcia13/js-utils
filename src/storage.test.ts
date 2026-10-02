import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage, createStorage } from './storage';

describe('createStorage', () => {
  let memoryStorage: Storage;

  beforeEach(() => {
    memoryStorage = createMemoryStorage();
  });

  it('should get and set string items with the namespaced key', () => {
    const storage = createStorage('user', memoryStorage);

    storage.setItem('alice');

    expect(memoryStorage.getItem('app-storage-user')).toBe('alice');
    expect(storage.getItem()).toBe('alice');
  });

  it('should return null when the item does not exist', () => {
    const storage = createStorage('missing', memoryStorage);

    expect(storage.getItem()).toBeNull();
    expect(storage.getJson()).toBeNull();
  });

  it('should get and set json values', () => {
    interface User { id: number; name: string }
    const storage = createStorage<User>('user', memoryStorage);
    const user = { id: 1, name: 'alice' };

    storage.setJson(user);

    expect(memoryStorage.getItem('app-storage-user')).toBe(JSON.stringify(user));
    expect(storage.getJson()).toEqual(user);
  });

  it('should clear all items from the provided storage', () => {
    memoryStorage.setItem('other-key', 'keep-me-not');
    const storage = createStorage('user', memoryStorage);

    storage.setItem('alice');
    storage.clear();

    expect(memoryStorage.length).toBe(0);
  });

  it('should remove the item from localStorage', () => {
    const localStorageMock = createMemoryStorage();
    vi.stubGlobal('localStorage', localStorageMock);

    const storage = createStorage('user', memoryStorage);
    localStorageMock.setItem('app-storage-user', 'alice');

    storage.removeItem();

    expect(localStorageMock.getItem('app-storage-user')).toBeNull();

    vi.unstubAllGlobals();
  });
});
