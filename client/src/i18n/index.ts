import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ru from "./locales/ru.json";
import uz from "./locales/uz.json";
import cyrl from "./locales/cyrl.json";

// Получаем язык из localStorage или используем русский по умолчанию
const savedLanguage = localStorage.getItem("language") || "ru";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    ru: {
      translation: ru,
    },
    uz: {
      translation: uz,
    },
    cyrl: {
      translation: cyrl,
    },
  },
  lng: savedLanguage,
  fallbackLng: "ru",
  interpolation: {
    escapeValue: false,
  },
});

export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language);
  localStorage.setItem("language", language);
};

export default i18n;
