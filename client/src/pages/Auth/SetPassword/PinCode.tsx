import { useState } from "react";
import styles from "./PinCode.module.scss";

interface PincodeProps {
  onComplete: (code: string) => void;
}

const PinCode = ({ onComplete }: PincodeProps) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"set" | "confirm">("set");
  const [error, setError] = useState(false);

  const handlePress = (num: number | string) => {
    if ((step === "set" ? pin.length : confirmPin.length) < 4) {
      if (step === "set") {
        const newPin = pin + num;
        setPin(newPin);
        if (newPin.length === 4) {
          setStep("confirm");
        }
      } else {
        const newConfirmPin = confirmPin + num;
        setConfirmPin(newConfirmPin);
        if (newConfirmPin.length === 4) {
          if (pin === newConfirmPin) {
            onComplete(pin);
            setPin("");
            setConfirmPin("");
            setStep("set");
          } else {
            setError(true);
            setPin("");
            setConfirmPin("");
            setStep("set");
          }
        }
      }
    }
  };

  const handleDelete = () => {
    if (step === "set") {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  return (
    <div className={`container ${styles.pinCode}`}>
      <h2 className={styles.title}>
        {step === "set" ? "Введите код-пароль" : "Подтвердите код"}
      </h2>
      <div className={styles.dots}>
        {[...Array(4)].map((_, i) => (
          <span
            key={i}
            className={
              step === "set"
                ? pin.length > i
                  ? styles.filled
                  : ""
                : confirmPin.length > i
                ? styles.filled
                : ""
            }></span>
        ))}
      </div>
      <div className={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "⌫", 0].map((num, i) => (
          <button
            key={i}
            className={styles.button}
            onClick={() => (num === "⌫" ? handleDelete() : handlePress(num))}>
            <strong className={styles.number}>{num}</strong>
            {typeof num === "number" && (
              <span className={styles.letters}>{getLetters(num)}</span>
            )}
          </button>
        ))}
      </div>
      {error && (
        <p className="errorText">Коды не совпадают, попробуйте снова</p>
      )}
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

export default PinCode;
