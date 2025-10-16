import "./toast.scss";

import { useEffect } from "react";
import {
  removeToast,
  selectToastMessage,
} from "../../../store/slices/Toast/toastSlice";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";

const Toast = () => {
  const dispatch = useAppDispatch();
  const message = useAppSelector(selectToastMessage);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        dispatch(removeToast());
      }, 1500); // Убираем тост через 3 секунды
      return () => clearTimeout(timer);
    }
  }, [message, dispatch]);

  const handleRemoveToast = () => {
    dispatch(removeToast());
  };

  if (!message) return null;
  return (
    <div className="square">
      <div className="square__box">
        <div className="square__box__text">
          <p>{message.text}</p>
        </div>

        <button onClick={handleRemoveToast}>OK</button>
      </div>
    </div>
  );
};

export default Toast;
