import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { doLogin } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await doLogin(username, password);
      navigate("/");
    } catch (err) {
      setError("Неправильное имя пользователя или пароль.");
      console.error(err);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 text-black">
      <div className="form-signin bg-body-secondary p-4 rounded-3 shadow" style={{ maxWidth: 360, width: "100%" }}>
        <form onSubmit={handleSubmit}>
          <i className="d-block mx-auto mb-4 fa-solid fa-dna fa-2x text-center" />
          <h1 className="h4 mb-3 fw-bold text-center">Вход ИС Расписание</h1>
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="form-floating mb-3">
            <input type="text" className="form-control" placeholder="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <label />
          </div>

          <div className="form-floating mb-3">
            <input type="password" className="form-control" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <label />
          </div>

          <button className="w-100 btn btn-primary btn-lg mb-2" type="submit">Войти</button>
        </form>
      </div>
    </div>
  );
}

export default Login;