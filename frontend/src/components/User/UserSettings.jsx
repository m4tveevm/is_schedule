import React, { useState } from "react";
import { updateUserSettings } from "../../services/api";

function UserSettings() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUpdateSettings = async () => {
    try {
      const response = await updateUserSettings({ email, password });
      console.log("Settings update response:", response.data);
      setSuccessMessage("Настройки успешно обновлены.");
      setErrorMessage("");
    } catch (error) {
      if (error.response) {
        console.error("Server error:", error.response.data);
        setErrorMessage(
          error.response.data.detail ||
            "Ошибка сервера. Проверьте данные и попробуйте снова.",
        );
      } else if (error.request) {
        console.error("Network error:", error.request);
        setErrorMessage("Ошибка сети. Проверьте подключение к интернету.");
      } else {
        console.error("Unexpected error:", error.message);
        setErrorMessage(
          "Произошла неожиданная ошибка. Попробуйте снова позже.",
        );
      }
    }
  };

  return (
    <div className="container">
      <h1>Настройки</h1>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Пароль</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button className="btn btn-primary mt-3" onClick={handleUpdateSettings}>
        Сохранить изменения
      </button>
      {successMessage && (
        <div className="alert alert-success mt-3">{successMessage}</div>
      )}
      {errorMessage && (
        <div className="alert alert-danger mt-3">{errorMessage}</div>
      )}
    </div>
  );
}

export default UserSettings;
