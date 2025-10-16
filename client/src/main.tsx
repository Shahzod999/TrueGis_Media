import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.tsx";
import "./index.scss";
import { store } from "./store";
import { initTelegramWebApp } from "./utils/telegramWebApp";
import Toast from "./components/common/Toast/Toast";

// Инициализируем Telegram WebApp при загрузке приложения
initTelegramWebApp();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <Toast />
      <App />
    </Provider>
  </React.StrictMode>,
);
