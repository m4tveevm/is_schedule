import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center bg-light">
      <div className="mt-4">
        <i className="fas fa-exclamation-circle fa-5x text-muted"></i>
      </div>
      <h1 className="display-4 text-dark">Кажется, вы зашли не туда...</h1>
      <p className="lead mt-3 text-secondary">
        Страница, которую вы ищете, не найдена или временно недоступна.
      </p>
      <p className="text-muted">
        Вы можете вернуться на главную или попробовать снова чуть позже.
      </p>
      <Link to="/" className="btn btn-outline-primary btn-lg mt-3">
        На главную
      </Link>
    </div>
  );
};

export default NotFound;
