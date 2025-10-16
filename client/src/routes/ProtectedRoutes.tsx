import { Outlet } from "react-router-dom";
import AccessPassword from "../pages/Auth/AccessPassword";
import { useEffect, useState, useCallback } from "react";
import {
  hapticVibration,
  hapticVibrationByType,
} from "../utils/hapticFeedback";
import Loading from "../components/common/Loading/Loading";
import { useTelegramCloudStorage } from "../hooks/useTelegramCloudStorage";

// Константы для статусов доступа
const ACCESS_STATUS = {
  GRANTED: null,
  PENDING: "pending",
} as const;

// Типы для статусов
type AccessStatus = (typeof ACCESS_STATUS)[keyof typeof ACCESS_STATUS];

const ProtectedRoutes = () => {
  const { value: accessPassword, isLoading } = useTelegramCloudStorage(
    "accessPassword",
    null
  );
  const [accessStatus, setAccessStatus] = useState<AccessStatus | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Проверка доступа
  const checkAccess = useCallback(() => {
    const isGranted = sessionStorage.getItem("isAccessGranted") === "true";
    const shouldGrantAccess =
      !accessPassword || accessPassword === "null" || isGranted;

    return shouldGrantAccess ? ACCESS_STATUS.GRANTED : ACCESS_STATUS.PENDING;
  }, [accessPassword]);

  // Инициализация состояния доступа
  useEffect(() => {
    if (!isLoading) {
      setAccessStatus(checkAccess());
      setIsReady(true);
    }
  }, [accessPassword, isLoading, checkAccess]);

  // Обработка ввода пароля
  const handleComplete = useCallback(
    async (code: string): Promise<boolean> => {
      if (!accessPassword) {
        hapticVibrationByType("error");
        return false;
      }

      const isCodeValid =
        code === accessPassword ||
        code === "biometric_success" ||
        code === "supportResetPassword";

      if (isCodeValid) {
        setAccessStatus(ACCESS_STATUS.GRANTED);
        sessionStorage.setItem("isAccessGranted", "true");
        hapticVibration("rigid");
      } else {
        hapticVibrationByType("error");
      }

      return isCodeValid;
    },
    [accessPassword]
  );

  // Пока данные загружаются — ничего не рендерим
  if (!isReady) {
    return <Loading />;
  }

  // Рендер соответствующего состояния
  switch (accessStatus) {
    case ACCESS_STATUS.PENDING:
      return <AccessPassword onComplete={handleComplete} />;
    case ACCESS_STATUS.GRANTED:
    default:
      return (
        <div className="protected-routes">
          <Outlet />
        </div>
      );
  }
};

export default ProtectedRoutes;
