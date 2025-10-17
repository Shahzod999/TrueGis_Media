import { Link, useLocation } from "react-router-dom";
import "./tabBar.scss";
import SVG from "react-inlinesvg";

const TabBar = () => {
  const { pathname } = useLocation();

  return (
    <div className="tab-bar">
      <Link to="/" className={`tab-bar__item ${pathname === "/" && "tab-bar__item__active"}`}>
        <span className="icon">
          <SVG src="./svg/reels.svg" />
        </span>
        <span className="label">Home</span>
      </Link>

      <Link to="/upload" className={`tab-bar__item tab-bar__item-upload ${pathname === "/upload" && "tab-bar__item__active"}`}>
        <div className="upload-btn">
          <span className="icon">
            {/* <SVG src="/svg/upload.svg" /> */}
            <img src="/trueGis.png" alt="upload" />
          </span>
        </div>
      </Link>

      <Link to="/profile" className={`tab-bar__item ${pathname === "/profile" && "tab-bar__item__active"}`}>
        <span className="icon">
          <SVG src="./svg/person.svg" />
        </span>
        <span className="label">Profile</span>
      </Link>
    </div>
  );
};

export default TabBar;
