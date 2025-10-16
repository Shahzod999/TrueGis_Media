import { useState } from "react";

const useBiometricAuth = () => {
  const biometricManager = window.Telegram?.WebApp?.BiometricManager;
  biometricManager.init();
  const biometricType = biometricManager.biometricType;

  // Состояния
  const [isAccessGranted, setIsAccessGranted] = useState(false);
  const [authStatus, setAuthStatus] = useState<"idle" | "success" | "failed">(
    "idle"
  );

  // 🔹 Запросить разрешение на биометрию
  const requestAccess = async () => {
    if (!biometricManager?.isInited) {
      alert("Biometric not inited yet!");
      return;
    }

    biometricManager.requestAccess(
      { reason: "The bot uses biometrics for authentication." },
      (access_granted: boolean) => {
        setIsAccessGranted(access_granted);
      }
    );
  };

  // 🔹 Открыть настройки, если доступ отклонен
  const openSettings = () => {
    if (!biometricManager?.isInited) {
      alert("Biometric not inited yet!");
      return;
    }

    if (
      !biometricManager.isBiometricAvailable ||
      !biometricManager.isAccessRequested ||
      biometricManager.isAccessGranted
    ) {
      return;
    }

    biometricManager.openSettings();
  };

  // 🔹 Аутентификация по биометрии
  const authenticate = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        if (!biometricManager?.isInited) {
          alert("Biometric not inited yet!");
          resolve(false);
          return;
        }

        setAuthStatus("idle");

        biometricManager.authenticate(
          { reason: "The bot requests biometrics for authentication." },
          (success: boolean, token?: string) => {
            if (success) {
              console.log("Biometric Auth Token:", token);
              setAuthStatus("success");
              resolve(true);
            } else {
              setAuthStatus("failed");
              resolve(false);
            }
          }
        );
      } catch (error) {
        console.error("Error during biometric authentication:", error);
        resolve(false);
      }
    });
  };

  return {
    isAccessGranted,
    authStatus,
    requestAccess,
    openSettings,
    authenticate,
    biometricType,
  };
};

export default useBiometricAuth;
