// This file is now hooks/usePersistence.js
// FIX: Converted to a generic TypeScript hook to provide type safety.
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

export function usePersistence<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) as T : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key) {
            try {
                setStoredValue(e.newValue ? JSON.parse(e.newValue) as T : initialValue);
            } catch (error) {
                console.error(error);
            }
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [storedValue, setValue];
}
