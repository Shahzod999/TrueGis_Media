import { Outlet } from "react-router-dom";
import TabBar from "../components/layout/TabBar/TabBar";
import useTelegramBackButton from "../hooks/useTelegramBackButton";

const MainRoutes = () => {
  useTelegramBackButton();

  return (
    <>
      <div className="main__content">
        <Outlet />
      </div>
      <TabBar />
    </>
  );
};

export default MainRoutes;
