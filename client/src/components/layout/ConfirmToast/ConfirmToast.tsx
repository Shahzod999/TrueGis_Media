import Lottie from "lottie-react";
import "./confirmToast.scss";
import { ReactElement } from "react";

interface ConfirmToastProps {
  title: string;
  red: string;
  blue: string;
  tgs?: any;
  ActionClick: () => void;
  onCancel: () => void;
  children?: ReactElement;
  isOpen: boolean;
}
const ConfirmToast = ({
  title,
  red,
  blue,
  tgs,
  ActionClick,
  onCancel,
  children,
  isOpen,
}: ConfirmToastProps) => {
  if (!isOpen) return null;
  return (
    <>
      <div className="confirmToast__background" onClick={onCancel}></div>
      <div className="confirmToast">
        <p>{title}</p>

        {children}

        {tgs && <Lottie animationData={tgs} className="confirmToast__lottie" />}

        <div className="confirmToast__buttons">
          <button className="confirmToast__buttons__clear" onClick={onCancel}>
            {red}
          </button>
          <span></span>
          <button
            className="confirmToast__buttons__cancel"
            onClick={ActionClick}>
            {blue}
          </button>
        </div>
      </div>
    </>
  );
};

export default ConfirmToast;
