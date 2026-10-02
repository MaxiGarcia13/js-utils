export function createStorage<T>(name: string, storage: Storage = localStorage) {
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
