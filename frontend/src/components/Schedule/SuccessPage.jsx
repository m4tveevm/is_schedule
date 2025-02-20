import React from "react";
import { useNavigate } from "react-router-dom";

function SuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="container text-center mt-5">
      <h1>Данные успешно сохранены!</h1>
      <p>
        Вы можете вернуться к редактированию расписания или посмотреть текущие
        записи.
      </p>
      <button
        className="btn btn-primary"
        onClick={() => navigate("/schedule/teacher/")}
      >
        Вернуться к расписанию преподавателей
      </button>
    </div>
  );
}

export default SuccessPage;
