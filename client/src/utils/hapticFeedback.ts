/// <reference types="telegram-web-app" />

/**
 * Функция для создания тактильной вибрации определенной интенсивности
 * @param style - стиль вибрации ("light", "medium", "heavy", "rigid", "soft")
 */
export const hapticVibration = (
  style: "light" | "medium" | "heavy" | "rigid" | "soft",
) => {
  const webApp = window.Telegram.WebApp;

  if (webApp && webApp.HapticFeedback) {
    webApp.HapticFeedback.impactOccurred(style);
  } else {
    console.warn("Telegram WebApp HapticFeedback is not available.");
  }
};

/**
 * Функция для создания тактильной вибрации в соответствии с типом уведомления
 * @param type - тип уведомления ("error", "success", "warning")
 */
export const hapticVibrationByType = (
  type: "error" | "success" | "warning",
) => {
  const webApp = window.Telegram.WebApp;

  if (webApp && webApp.HapticFeedback) {
    webApp.HapticFeedback.notificationOccurred(type);
  } else {
    console.warn("Telegram WebApp HapticFeedback is not available.");
  }
}; 