
/**
 * A storage utility that mimics AsyncStorage API from React Native
 * but uses localStorage for web environments
 */

export type StorageKey = string;

export const storage = {
  async getItem(key: StorageKey): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error getting item from storage:', e);
      return null;
    }
  },

  async setItem(key: StorageKey, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Error setting item in storage:', e);
    }
  },

  async removeItem(key: StorageKey): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing item from storage:', e);
    }
  },

  async multiGet(keys: StorageKey[]): Promise<[string, string | null][]> {
    try {
      return keys.map(key => [key, localStorage.getItem(key)]);
    } catch (e) {
      console.error('Error getting multiple items from storage:', e);
      return keys.map(key => [key, null]);
    }
  },

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } catch (e) {
      console.error('Error setting multiple items in storage:', e);
    }
  },

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  }
};

// Convenience methods for JSON data
export const jsonStorage = {
  async getItem<T>(key: StorageKey): Promise<T | null> {
    const value = await storage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch (e) {
        console.error('Error parsing JSON from storage:', e);
      }
    }
    return null;
  },

  async setItem<T>(key: StorageKey, value: T): Promise<void> {
    try {
      await storage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error stringifying and setting JSON in storage:', e);
    }
  }
};
