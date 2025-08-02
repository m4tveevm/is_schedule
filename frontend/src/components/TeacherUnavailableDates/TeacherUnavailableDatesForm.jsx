import { useState, useEffect } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Russian } from "flatpickr/dist/l10n/ru.js";
import { useParams, useNavigate } from "react-router-dom";
import StepsNav from "../StepsNav";
import { toast } from "react-toastify";
import {
  getTeacherById,
  getTeacherUnavailableDates,
  createTeacherUnavailableDates,
  updateTeacherUnavailableDates,
} from "../../services/api";

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function TeacherUnavailableDatesForm() {
  const { id: teacherId } = useParams();
  const navigate = useNavigate();
  const [teacherName, setTeacherName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getTeacherById(teacherId),
      getTeacherUnavailableDates(teacherId),
    ])
      .then(([teacherRes, datesRes]) => {
        const teacherData = teacherRes.data;
        setTeacherName(
          `${teacherData.surname} ${teacherData.name} ${teacherData.lastname}`,
        );
        const existing = datesRes.data[0];
        if (existing && existing.dates) {
          const sortedDates = existing.dates
            .slice()
            .sort((a, b) => new Date(a) - new Date(b));
          const parsed = sortedDates.map((d) => new Date(d));
          setSelectedDates(parsed);
        } else {
          setSelectedDates([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Не удалось загрузить данные.");
        toast.error("Не удалось загрузить данные.");
      })
      .finally(() => setLoading(false));
  }, [teacherId]);

  const handleDateChange = (dates) => {
    const sortedDates = dates.slice().sort((a, b) => a - b);
    setSelectedDates(sortedDates);
  };

  const removeDate = (dateStr) => {
    const updatedSelected = selectedDates.filter(
      (d) => formatLocalDate(d) !== dateStr,
    );
    setSelectedDates(updatedSelected);
  };

  const handleSave = () => {
    if (selectedDates.length === 0) {
      toast.info("Пожалуйста, выберите хотя бы одну дату.");
      return;
    }
    const newDates = selectedDates
      .map((d) => formatLocalDate(d))
      .sort((a, b) => new Date(a) - new Date(b));

    getTeacherUnavailableDates(teacherId)
      .then((res) => {
        const existing = res.data[0];
        if (existing) {
          return updateTeacherUnavailableDates(
            existing.id,
            teacherId,
            newDates,
          );
        } else {
          return createTeacherUnavailableDates(teacherId, newDates);
        }
      })
      .then(() => {
        toast.success("Даты успешно сохранены!");
        navigate("/teacher_unavailable_dates");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Ошибка при сохранении дат.");
      });
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <StepsNav currentStep={8} />
      <h1>Недоступные даты преподавателя</h1>
      <p className="text-muted">{teacherName}</p>
      <p>
        Выберите даты, в которые преподаватель недоступен. Обратите внимание:
        выбор дат в прошлом запрещен.
      </p>
      <Flatpickr
        value={selectedDates}
        options={{
          locale: Russian,
          dateFormat: "Y-m-d",
          mode: "multiple",
          minDate: "today",
        }}
        onChange={handleDateChange}
      />
      {selectedDates.length === 0 && (
        <small className="form-text text-muted">
          Пока не выбраны даты. Вы можете выбрать одну или несколько дат.
        </small>
      )}
      <h3 className="mt-4">Выбранные даты:</h3>
      {selectedDates.length === 0 ? (
        <p>Нет выбранных дат</p>
      ) : (
        <ul className="list-group">
          {selectedDates.map((d) => {
            const ds = formatLocalDate(d);
            return (
              <li
                key={ds}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {ds}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => removeDate(ds)}
                >
                  Удалить
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-3">
        <button className="btn btn-success" onClick={handleSave}>
          Сохранить
        </button>
        <button
          className="btn btn-secondary ms-2"
          onClick={() => navigate("/teacher_unavailable_dates")}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

export default TeacherUnavailableDatesForm;
