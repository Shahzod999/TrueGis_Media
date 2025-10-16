import Lottie from "lottie-react";
import styles from "./password.module.scss";
import passwordUtya from "../../../../public/utya/password.json";
import { useURLState } from "../../../hooks/useURLState";
import PinCode from "./PinCode";
import { useNavigate } from "react-router";
import { hapticVibrationByType } from "../../../utils/hapticFeedback";
import { succesToast } from "../../../store/slices/Toast/toastSlice";
import { useAppDispatch } from "../../../hooks/redux";
import OpenFromSide from "../../../components/common/OpenFromSide/OpenFromSide";
import Button from "../../../components/ui/Button/Button";
import { useTelegramCloudStorage } from "../../../hooks/useTelegramCloudStorage";
import Loading from "../../../components/common/Loading/Loading";

const Password = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { getParam, setParam } = useURLState();
  const initialPage = Boolean(getParam("setPassword"));

  const { value, saveValue, isLoading } = useTelegramCloudStorage<
    string | null
  >("accessPassword", null);

  const handleRemovePassword = () => {
    dispatch(succesToast("Пароль удален"));
    saveValue(null);
    hapticVibrationByType("success");
  };

  if (isLoading) return <Loading />;
  return (
    <>
      <div className={`container container__side ${styles.password}`}>
        {value && value !== "null" ? (
          <div className={styles.main}>
            <strong>У вас уже установлен пароль</strong>
            <Button onClick={handleRemovePassword} size="large">
              🗑 Удалить пароль
            </Button>
          </div>
        ) : (
          <div className={styles.main}>
            <Lottie
              animationData={passwordUtya}
              className={styles.animationData}
            />
            <Button onClick={() => setParam("setPassword", true)} size="large">
              Установить код-пароль
            </Button>
          </div>
        )}
      </div>

      <OpenFromSide
        isOpen={initialPage}
        onClose={() => setParam("setPassword", false)}>
        <PinCode
          onComplete={(code: string) => {
            saveValue(code);
            dispatch(succesToast("Пароль Установлен"));
            hapticVibrationByType("success");
            navigate("/settings");
          }}
        />
      </OpenFromSide>
    </>
  );
};

export default Password;
