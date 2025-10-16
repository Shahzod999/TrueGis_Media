import React, { memo, useCallback, useEffect, useState } from "react";
import "./bottomSheet.scss";

import { useLocation } from "react-router";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BottomSheet = memo(({ isOpen, onClose, children }: BottomSheetProps) => {
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return;
    const touchY = e.touches[0].clientY;
    setCurrentY(touchY);
    if (touchY - startY > 0) {
      setIsDragging(true);
    }
  };

  const handleTouchEnd = () => {
    if (startY !== null && currentY !== null && currentY - startY > 100) {
      handleClose();
    }

    setStartY(null);
    setCurrentY(null);
    setIsDragging(false);
  };

  const { pathname } = useLocation();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      tg.BackButton.show();

      tg.BackButton.onClick(handleClose);
      return () => {
        tg.BackButton.offClick(handleClose);
      };
    } else {
      if (pathname == "/") {
        tg.BackButton.hide();
      }
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = ""; // ✅ Гарантированное восстановление
      tg.BackButton.offClick(handleClose);
    };
  }, [isOpen, pathname, onClose]);

  return (
    <>
      <div
        className={`bottom__wrapper ${isOpen ? "bottom__wrapper--active" : ""}`}
        onClick={handleClose}></div>
      <div
        className={`bottom-sheet ${isOpen ? "bottom-sheet--open" : ""} ${
          isDragging ? "bottom-sheet--dragging" : ""
        }`}
        draggable={false}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}>
        <div className="bottom-sheet__content">
          <div className="bottom-sheet__close" onClick={handleClose}>
            <div></div>
          </div>
          {children}
        </div>
      </div>
    </>
  );
});

export default BottomSheet;
