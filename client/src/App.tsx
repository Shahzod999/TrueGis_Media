import { useEffect } from "react";
import AppRouter from "./routes";
import "./i18n";
import { useCloudStorage } from "./hooks/useCloudStorage";
import i18n from "./i18n";
import { useLocation } from "./utils/locationUtils";

const App = () => {
  const { value: language } = useCloudStorage("language", "ru");
  const { handleLocation } = useLocation();

  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  useEffect(() => {
    handleLocation();
  }, [handleLocation]);

  return <AppRouter />;
};

export default App;
