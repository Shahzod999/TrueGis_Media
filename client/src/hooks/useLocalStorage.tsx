import { useState, useEffect } from "react";

/**
 * Хук для работы с localStorage как с состоянием React
 * @param key Ключ для localStorage
 * @param initialValue Начальное значение, если в localStorage ничего нет
 * @returns [value, setValue] - текущее значение и функция для его обновления
 */
function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
  // Состояние для хранения нашего значения
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      // Получаем из localStorage по ключу
      const item = window.localStorage.getItem(key);
      // Парсим сохранённое значение или возвращаем initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // В случае ошибки также возвращаем initialValue
      console.error(error);
      return initialValue;
    }
  });

  // Функция-обёртка для useState's setter, которая также сохраняет в localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Разрешаем value быть функцией, чтобы API было похоже на useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Сохраняем состояние
      setStoredValue(valueToStore);
      // Сохраняем в localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Обновляем состояние, если значение в localStorage изменилось
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== JSON.stringify(storedValue)) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.error(error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, initialValue, storedValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;
