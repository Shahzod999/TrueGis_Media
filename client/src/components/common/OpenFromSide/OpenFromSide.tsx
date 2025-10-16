import React, { useEffect, useRef, useState } from "react";
import styles from "./OpenFromSide.module.scss";

interface OpenFromSideProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const OpenFromSide: React.FC<OpenFromSideProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const startXRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setPosition(0);
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isOpen) return;
    
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isOpen) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    
    // Only allow dragging to the right (positive diff)
    if (diff > 0) {
      const newPosition = diff;
      setPosition(newPosition);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || !isOpen) return;
    
    setIsDragging(false);
    
    // If dragged more than 30% of the panel width, close it
    if (position > window.innerWidth * 0.3) {
      onClose();
    } else {
      // Reset position
      setPosition(0);
    }
  };

  const panelStyle = {
    transform: position > 0 ? `translateX(${position}px)` : undefined,
    transition: isDragging ? 'none' : 'transform 0.3s ease-in-out, right 0.4s ease-in-out'
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`}
        onClick={onClose}></div>

      <div 
        className={`${styles.panel} ${isOpen ? styles.open : ""}`}
        ref={panelRef}
        style={panelStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </>
  );
};

export default OpenFromSide;
