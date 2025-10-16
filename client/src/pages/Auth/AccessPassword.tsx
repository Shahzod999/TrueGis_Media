import { useState, useCallback } from "react";
import styles from "./SetPassword/PinCode.module.scss";
import SVG from "react-inlinesvg";
import useBiometricAuth from "../../hooks/useBiometricAuth";
import { useAppDispatch } from "../../hooks/redux";
import { errorToast, succesToast } from "../../store/slices/Toast/toastSlice";
import {
  hapticVibration,
  hapticVibrationByType,
} from "../../utils/hapticFeedback";
import { useTelegramCloudStorage } from "../../hooks/useTelegramCloudStorage";
import ConfirmToast from "../../components/layout/ConfirmToast/ConfirmToast";
interface PincodeProps {
  onComplete: (code: string) => Promise<boolean>;
}

const AccessPassword = ({ onComplete }: PincodeProps) => {
  const { saveValue } = useTelegramCloudStorage<string | null>(
    "accessPassword",
    null
  );
  const {
    isAccessGranted,
    requestAccess,
    openSettings,
    authenticate,
    biometricType,
  } = useBiometricAuth();

  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  // Автоматический запуск биометрии при наличии разрешения
  // useEffect(() => {
  //   if (isAccessGranted && authStatus === "idle") {
  //     handleBiometricAuth();
  //   }
  // }, [isAccessGranted, authStatus]);

  const handlePress = useCallback(
    async (num: number | string) => {
      if (pin.length >= 4) return;

      const newPin = pin + num;
      setPin(newPin);

      if (newPin.length === 4) {
        const isConfirmed = await onComplete(newPin);
        if (!isConfirmed) {
          setError("Неверный код");
          dispatch(errorToast("Неверный код"));
          setPin("");
        }
      }
      hapticVibration("soft");
    },
    [pin, onComplete, dispatch]
  );

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    hapticVibration("light");
  }, []);

  const handleBiometricAuth = useCallback(async () => {
    try {
      // Если доступ еще не запрашивался
      if (!isAccessGranted) {
        await requestAccess();
        if (!isAccessGranted) {
          openSettings();
          return;
        }
      }

      // Пытаемся аутентифицировать
      const success = await authenticate();
      if (success) {
        const isConfirmed = await onComplete("biometric_success");
        if (!isConfirmed) {
          throw new Error("Ошибка подтверждения");
        }
      } else {
        throw new Error("Ошибка биометрии");
      }
    } catch (error) {
      dispatch(errorToast("Ошибка биометрии"));
      setError("Ошибка биометрии");
    }
  }, [
    isAccessGranted,
    requestAccess,
    authenticate,
    onComplete,
    dispatch,
    openSettings,
  ]);

  const renderButtons = useCallback(() => {
    const buttons = [1, 2, 3, 4, 5, 6, 7, 8, 9, "⌫", 0];

    return buttons.map((num, i) => (
      <button
        key={i}
        className={styles.button}
        onClick={() => (num === "<" ? handleDelete() : handlePress(num))}>
        <strong className={styles.number}>{num}</strong>
        {typeof num === "number" && (
          <span className={styles.letters}>{getLetters(num)}</span>
        )}
      </button>
    ));
  }, [handleDelete, handlePress]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [resetPassword, setResetPassword] = useState("");

  const handleResetPassword = async () => {
    if (resetPassword === "1999") {
      const isConfirmed = await onComplete("supportResetPassword");
      if (!isConfirmed) {
        dispatch(errorToast("Неверный код"));
        return;
      }
      dispatch(succesToast("Пароль удален"));
      saveValue(null);
      hapticVibrationByType("success");
    } else {
      dispatch(errorToast("Неверный код"));
    }
  };

  return (
    <div className={`container ${styles.pinCode}`}>
      <h2 className={styles.title}>Введите код-пароль</h2>
      <div className={styles.dots}>
        {[...Array(4)].map((_, i) => (
          <span key={i} className={pin.length > i ? styles.filled : ""}></span>
        ))}
      </div>
      <div className={styles.grid}>
        {renderButtons()}
        <button
          className={styles.biometricButton}
          onClick={handleBiometricAuth}>
          <SVG src={`/svg/${biometricType}.svg`} />
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <p className="errorText">{error}</p>

          <h2
            className={styles.forgotPassword}
            onClick={() => setShowConfirm(true)}>
            Забыли пароль?
          </h2>
        </div>
      )}

      <ConfirmToast
        isOpen={showConfirm}
        onCancel={() => setShowConfirm(false)}
        title="Поддержка вам даст пароль сброса"
        red="Отменить"
        blue="Удалить"
        ActionClick={handleResetPassword}>
        <div className={styles.resetInput}>
          <input
            type="text"
            onChange={(e) => setResetPassword(e.target.value)}
            value={resetPassword}
          />
        </div>
      </ConfirmToast>
    </div>
  );
};

const getLetters = (num: number) => {
  const mapping: Record<number, string> = {
    1: "",
    2: "ABC",
    3: "DEF",
    4: "GHI",
    5: "JKL",
    6: "MNO",
    7: "PQRS",
    8: "TUV",
    9: "WXYZ",
    0: "",
  };
  return mapping[num] || "";
};

export default AccessPassword;
