import { useState, useEffect, useCallback, useRef } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const initializer = useRef((key: string, initialValue: T): T => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const [storedValue, setStoredValue] = useState<T>(() => 
    initializer.current(key, initialValue)
  );

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      const stringifiedNext = JSON.stringify(valueToStore);
      const stringifiedCurrent = JSON.stringify(storedValue);

      if (stringifiedCurrent === stringifiedNext) return;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, stringifiedNext);
        window.dispatchEvent(new Event("local-storage"));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const latestValue = initializer.current(key, initialValue);
        const stringifiedLatest = JSON.stringify(latestValue);
        const stringifiedCurrent = JSON.stringify(storedValue);

        if (stringifiedCurrent !== stringifiedLatest) {
          setStoredValue(latestValue);
        }
      } catch (e) {
        console.error("Sync error", e);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage", handleStorageChange);
    };
  }, [key, initialValue, storedValue]); 

  return [storedValue, setValue] as const;
}