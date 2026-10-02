const defaultStorage = typeof window !== 'undefined' ? localStorage : createMemoryStorage()
;
export function createStorage<T>(name: string, storage: Storage = defaultStorage) {
  const key = `app-storage-${name}`;

  return {
    getItem: () => storage.getItem(key),
    setItem: (value: string) => storage.setItem(key, value),
    removeItem: () => localStorage.removeItem(key),
    clear: () => storage.clear(),
    getJson: (): T | null => {
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : null;
    },
    setJson: (value: T) => storage.setItem(key, JSON.stringify(value)),
  };
}

export function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    key: (index) => [...store.keys()][index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}
