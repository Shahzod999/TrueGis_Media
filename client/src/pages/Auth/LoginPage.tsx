import "./style.scss";
import Button from "../../components/ui/Button/Button";
import { useLoginMutation } from "../../api/endpoints/authApiSlice";
import { useState } from "react";
import { ReactSVG } from "react-svg";
import { useAppDispatch } from "../../hooks/redux";
import { setToken } from "../../store/slices/companySlice";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading, error }] = useLoginMutation();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const formData = new FormData();
      formData.append("username", credentials.username);
      formData.append("password", credentials.password);

      const response = await login(formData).unwrap();

      dispatch(setToken(response.access_token));
      if (response.access_token) {
        navigate("/");
      }
    } catch (err) {
      console.error("Ошибка при входе:", err);
    }
  };

  return (
    <div className="login-container container__side">
      <h2>Вход</h2>
      <input
        type="text"
        placeholder="Username"
        value={credentials.username}
        onChange={(e) =>
          setCredentials({ ...credentials, username: e.target.value })
        }
      />
      <div className="password-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={credentials.password}
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
        />
        <span className="icon" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? (
            <ReactSVG src="/public/svg/eye.svg" />
          ) : (
            <ReactSVG src="/public/svg/eyeSlash.svg" />
          )}
        </span>
      </div>

      <Button variant="primary" onClick={handleLogin} disabled={isLoading}>
        {isLoading ? "Загрузка..." : "Войти"}
      </Button>

      {error && (
        <p className="error">
          Ошибка: {(error as any).data?.message || "Не удалось войти"}
        </p>
      )}
    </div>
  );
};

export default LoginPage;
