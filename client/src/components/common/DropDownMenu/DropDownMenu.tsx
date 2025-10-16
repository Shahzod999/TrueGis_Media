import { FocusEvent, ReactNode, useEffect, useRef, useState } from "react";
import "./DropDownMenu.scss";
import { ReactSVG } from "react-svg";

interface DropDownMenuProps {
  toggle: ReactNode;
  menu: ReactNode;
  notAwalible?: boolean;
  onClick?: () => void;
}
const DropDownMenu = ({ toggle, menu, notAwalible, onClick }: DropDownMenuProps) => {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggleClick = () => {
    if (notAwalible) return;
    setOpen((prev) => !prev);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (
      toggleRef.current &&
      !toggleRef.current.contains(event.relatedTarget as Node) &&
      menuRef.current &&
      !menuRef.current.contains(event.relatedTarget as Node)
    ) {
      setOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toggleRef.current &&
        !toggleRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`dropdownMenuHolder ${open ? "deleteAfter" : ""}`} onClick={onClick}>
      <div
        className="dropdown__toggle"
        tabIndex={0}
        ref={toggleRef}
        onClick={handleToggleClick}
        onBlur={handleBlur}>
        <div className="dropdown__toggle__main">{toggle}</div>

        {!notAwalible && (
          <span
            className={`dropdown__icon ${open ? "dropdown__icon--open" : ""}`}>
            <ReactSVG
              src="./arrows/arrowDown.svg"
              className="actions__arrowRight"
            />
          </span>
        )}
      </div>
      <div
        ref={menuRef}
        tabIndex={-1} // для возможности фокусировки внутри меню
        onBlur={handleBlur}
        className={`dropdown__menu ${open ? "dropdown__menu--open" : ""}`}>
        {menu}
      </div>
    </div>
  );
};

export default DropDownMenu;
