import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import MainRoutes from "./MainRoutes";
import Loading from "../components/common/Loading/Loading";
import HomePage from "../pages/Home/HomePage";
import ProfilePage from "../pages/Profile/ProfilePage";
import UploadPage from "../pages/Upload/UploadPage";

// Lazy-загрузка страниц
const LoginPage = lazy(() => import("../pages/Auth/LoginPage"));
const Password = lazy(() => import("../pages/Auth/SetPassword/Password"));
const Settings = lazy(() => import("../pages/Settings/Settings"));

const AppRouter = () => {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<MainRoutes />}>
            <Route index element={<HomePage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route
              path="login"
              element={
                <Suspense fallback={<Loading />}>
                  <LoginPage />
                </Suspense>
              }
            />
            <Route 
              path="settings" 
              element={
                <Suspense fallback={<Loading />}>
                  <Settings />
                </Suspense>
              } 
            />
            <Route
              path="password"
              element={
                <Suspense fallback={<Loading />}>
                  <Password />
                </Suspense>
              }
            />

            {/* Защищенные маршруты */}
            <Route element={<ProtectedRoutes />}></Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRouter;
