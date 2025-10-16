import { useState, useEffect } from "react";

const tg = window.Telegram?.WebApp;
const isCloudStorageAvailable = tg?.version >= "6.9";

export const useTelegramCloudStorage = <T,>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isCloudStorageAvailable) {
      console.warn("CloudStorage недоступен в данной версии Telegram WebApp");
      setIsLoading(false);
      return;
    }

    tg.CloudStorage.getItem(key, (error: any, storedValue: string | null) => {
      if (error) {
        console.error(`Ошибка загрузки ${key} из CloudStorage:`, error);
        setValue(defaultValue);
      } else {
        setValue((storedValue as T) || defaultValue);
      }
      setIsLoading(false);
    });
  }, [key, defaultValue]);

  const saveValue = (newValue: T) => {
    if (!isCloudStorageAvailable) return;
    setValue(newValue);
    tg.CloudStorage.setItem(key, String(newValue));
  };

  return { value, isLoading, saveValue };
};
