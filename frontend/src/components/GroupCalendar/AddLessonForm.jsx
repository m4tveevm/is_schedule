import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../services/api";

function AddLessonForm({ date, plan, onCancel, onAdd, busyTeachers = [] }) {
  const [lessonType, setLessonType] = useState("");
  const [teacherQuery, setTeacherQuery] = useState("");
  const [teacherSuggestions, setTeacherSuggestions] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!teacherQuery.trim()) {
      setTeacherSuggestions([]);
      setSelectedTeacher(null);
      return;
    }
    axios
      .get(
        `${API_BASE_URL}teachers/?search=${encodeURIComponent(teacherQuery)}`,
      )
      .then((res) => {
        const suggestions = res.data.filter(
          (t) => !busyTeachers.includes(t.id),
        );
        setTeacherSuggestions(suggestions);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Ошибка при поиске преподавателей.");
      });
  }, [teacherQuery, busyTeachers]);

  const handleSelectTeacher = (t) => {
    setSelectedTeacher(t);
    setTeacherQuery(t.shortname);
    setTeacherSuggestions([]);
  };

  const handleSubmit = () => {
    if (!lessonType) {
      toast.info("Выберите тип занятия!");
      return;
    }
    if (!selectedTeacher) {
      toast.info("Выберите преподавателя!");
      return;
    }
    if (plan[lessonType] <= 0) {
      toast.info(`По типу ${lessonType} больше нет доступных часов!`);
      return;
    }

    setIsChecking(true);

    axios
      .get(
        `${API_BASE_URL}teacher_unavailable_dates?teacher_id=${selectedTeacher.id}`,
      )
      .then((res) => {
        const unavailable = res.data[0];
        if (unavailable && unavailable.dates.includes(date)) {
          toast.error("Преподаватель недоступен в эту дату");
        } else {
          onAdd({ lessonType, teacher: selectedTeacher, date });
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Ошибка при проверке занятости преподавателя");
      })
      .finally(() => setIsChecking(false));
  };

  return (
    <div className="border p-2 mb-2">
      <h5>Добавить занятие на {date}</h5>

      <div className="mb-2">
        <label>Тип занятия:</label>
        <select
          className="form-control"
          value={lessonType}
          onChange={(e) => setLessonType(e.target.value)}
        >
          <option value="">-- Выберите --</option>
          {["УП", "КЛ", "ДК"].map((lt) => (
            <option key={lt} value={lt} disabled={plan[lt] <= 0}>
              {lt} (осталось {plan[lt]} ч)
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <label>Поиск преподавателя:</label>
        <input
          type="text"
          className="form-control"
          placeholder="Фамилия, имя, отчество..."
          value={teacherQuery}
          onChange={(e) => setTeacherQuery(e.target.value)}
        />
        {teacherSuggestions.length > 0 && (
          <ul className="list-group mt-1">
            {teacherSuggestions.map((t) => (
              <li
                key={t.id}
                className="list-group-item"
                style={{ cursor: "pointer" }}
                onMouseDown={() => handleSelectTeacher(t)}
              >
                {t.surname} {t.name} {t.lastname} ({t.shortname})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="d-flex gap-2">
        <button
          className="btn btn-success"
          onClick={handleSubmit}
          disabled={isChecking}
        >
          {isChecking ? "Проверка..." : "Добавить"}
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </div>
  );
}

export default AddLessonForm;
