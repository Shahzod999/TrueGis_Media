import { useEffect } from "react";
import { useLocation } from "react-router";
import { useNavigate } from "react-router";
import { useURLState } from "./useURLState";

const useTelegramBackButton = () => {
  const { allParams, deleteParam } = useURLState();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  //   const prevParamsRef = useRef(allParams); // Отслеживаем предыдущее состояние

  useEffect(() => {
    const backButton = window.Telegram.WebApp.BackButton;
    if (!backButton) return;

    if (pathname === "/" && Object.keys(allParams).length === 0) {
      backButton.hide();
      return;
    }
    backButton.show();

    const keys = Object.keys(allParams).reverse();
    const pathSegments = pathname.split("/").filter(Boolean);

    const handleBack = () => {
      if (keys.length > 0) {
        const lastKey = keys[0];
        console.log(lastKey, "lastKey (удаляем параметр)");
        deleteParam(lastKey);
      } else if (pathSegments.length > 1) {
        // Убираем последний сегмент из пути
        const newPath = "/" + pathSegments.slice(0, -1).join("/");
        console.log(newPath, "newPath (удаляем часть пути)");
        navigate(newPath);
      } else {
        navigate("/");
      }
    };

    backButton.onClick(handleBack);

    return () => {
      backButton.hide();
      backButton.offClick(handleBack);
    };
  }, [allParams, navigate, deleteParam]);
};

export default useTelegramBackButton;
