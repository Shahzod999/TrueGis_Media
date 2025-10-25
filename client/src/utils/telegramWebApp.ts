/// <reference types="telegram-web-app" />

import OrientationLock from "./OrientationLock";
import { hapticVibration } from "./hapticFeedback";
// import eruda from "eruda";

export const tg = window.Telegram?.WebApp;

// Функция для инициализации Telegram WebApp
export const initTelegramWebApp = () => {
  if (!tg) {
    console.warn("Telegram WebApp not available");
    return;
  }

  // Сообщаем Telegram, что приложение готово
  tg.ready();

  // Разворачиваем приложение на весь экран
  tg.expand();
  // eruda.init();

  // Инициализация блокировки ориентации
  const orientation = OrientationLock();
  orientation.init();

  // Проверка версии Telegram
  const requiredVersion = "8.0";
  const currentVersion = tg.version;

  // Применяем дополнительные настройки для современных версий приложения
  if (currentVersion >= requiredVersion && (tg.platform === "ios" || tg.platform === "android")) {
    // Отключаем вертикальные свайпы
    if (typeof (tg as any).disableVerticalSwipes === "function") {
      (tg as any).disableVerticalSwipes();
    }

    // Устанавливаем цвет фона из параметров темы
    if (tg.themeParams?.bg_color) {
      tg.setBackgroundColor(tg.themeParams.bg_color);
    }

    // Запрашиваем полноэкранный режим
    // Метод может отсутствовать в типах, но присутствовать в реальном API
    // if (typeof (tg as any).requestFullscreen === "function") {
    //   (tg as any).requestFullscreen();
    // }

    // Вызываем тактильную вибрацию
    hapticVibration("rigid");
  }
};

export default initTelegramWebApp;
