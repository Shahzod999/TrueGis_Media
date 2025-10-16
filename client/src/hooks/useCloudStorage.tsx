import { useState, useEffect } from "react";

const tg = window.Telegram?.WebApp;
const isCloudStorageAvailable = tg?.version >= "6.9";

export const useCloudStorage = <T,>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isCloudStorageAvailable) {
      // Используем CloudStorage, если доступен
      tg.CloudStorage.getItem(key, (error: any, storedValue: string | null) => {
        if (error) {
          console.error(`Ошибка при загрузке ${key} из CloudStorage:`, error);
          setValue(defaultValue);
        } else {
          setValue((storedValue as T) || defaultValue);
        }
        setIsLoading(false);
      });
    } else {
      // Используем localStorage в качестве fallback
      const localValue = localStorage.getItem(key);
      setValue(localValue ? (localValue as T) : defaultValue);
      setIsLoading(false);
    }
  }, [key, defaultValue]);

  const saveValue = (newValue: T) => {
    setValue(newValue);
    if (isCloudStorageAvailable) {
      tg.CloudStorage.setItem(key, String(newValue));
    } else {
      localStorage.setItem(key, String(newValue));
    }
  };

  return { value, isLoading, saveValue };
};
