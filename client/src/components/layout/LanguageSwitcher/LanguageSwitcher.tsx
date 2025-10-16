import styles from "./settings.module.scss";
import { ReactSVG } from "react-svg";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";
import useLocalStorage from "../../../hooks/useLocalStorage";
// Тип для языка
type Language = "ru" | "uz" | "cyrl" | "en";

// Интерфейс для объекта языка
interface LanguageOption {
  code: Language;
  title: string;
  nativeTitle: string;
}

const LanguageSwitcher = () => {
  const [language, setLanguage] = useLocalStorage<Language>("language", "ru");
  const { t } = useTranslation();

  // Массив языков для удобного маппинга
  const languages: LanguageOption[] = [
    { code: "ru", title: "Русский", nativeTitle: "Русский" },
    { code: "uz", title: "Uzbek", nativeTitle: "O'zbek" },
    { code: "cyrl", title: "Узбек", nativeTitle: "Узбек" },
    { code: "en", title: "English", nativeTitle: "English" },
  ];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <div className={styles.lang}>
      <h2 className={styles.title}>{t("settings.languages")}</h2>

      <div className={styles.langBox}>
        {languages.map((lang) => (
          <div
            key={lang.code}
            className={styles.tabs}
            onClick={() => handleLanguageChange(lang.code)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" && handleLanguageChange(lang.code)
            }>
            <div>
              <strong>{lang.title}</strong>
              <span>{lang.nativeTitle}</span>
            </div>
            {language === lang.code && (
              <ReactSVG src="svg/arrows/ok.svg" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
