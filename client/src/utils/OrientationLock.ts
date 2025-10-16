/// <reference types="telegram-web-app" />

// Объявляем необходимые типы для работы с ориентацией
declare global {
  interface WebApp {
    lockOrientation: () => void;
    unlockOrientation: () => void;
  }

  interface WebAppEventsMap {
    activated: () => void;
    deactivated: () => void;
  }

  interface WebApp {
    onEvent<K extends keyof WebAppEventsMap>(
      event: K,
      callback: WebAppEventsMap[K],
    ): void;
    offEvent<K extends keyof WebAppEventsMap>(
      event: K,
      callback: WebAppEventsMap[K],
    ): void;
  }
}

const OrientationLock = () => {
  const isSupported = "orientation" in screen;

  const lock = () => Telegram.WebApp.lockOrientation();
  const unlock = () => Telegram.WebApp.unlockOrientation();

  const check = () => {
    if (!["ios", "android"].includes(Telegram.WebApp.platform)) return;
    if ((screen.orientation as any).type.startsWith("portrait")) {
      lock();
    } else {
      unlock();
    }
  };

  const enableListeners = () => {
    if (!isSupported) return;
    window.addEventListener("orientationchange", check);
    Telegram.WebApp.onEvent("activated", check);
    Telegram.WebApp.onEvent("deactivated", unlock);
  };

  const disableListeners = () => {
    if (!isSupported) return;
    window.removeEventListener("orientationchange", check);
    Telegram.WebApp.offEvent("activated", check);
    Telegram.WebApp.offEvent("deactivated", unlock);
  };

  const init = () => {
    check();
    enableListeners();
  };

  return { init, disableListeners };
};

export default OrientationLock; 