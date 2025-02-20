import React, { useState, useEffect } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Russian } from "flatpickr/dist/l10n/ru.js";
import { useParams, useNavigate } from "react-router-dom";
import StepsNav from "../StepsNav";
import { API_BASE_URL } from "../../services/api";
import axios from "axios";
import { toast } from "react-toastify";

function GroupAvailableDatesForm() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE_URL}groups/${groupId}/`),
      axios.get(`${API_BASE_URL}group_available_dates/?group_id=${groupId}`),
    ])
      .then(([groupRes, datesRes]) => {
        setGroupName(groupRes.data.name);
        const existing = datesRes.data[0];
        if (existing) {
          const parsed = existing.dates.map((d) => {
            const [year, month, day] = d.split("-").map(Number);
            return new Date(year, month - 1, day);
          });
          parsed.sort((a, b) => a - b);
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
  }, [groupId]);

  const handleDateChange = (dates) => {
    dates.sort((a, b) => a - b);
    setSelectedDates(dates);
  };

  const removeDate = (dateStr) => {
    const updatedSelected = selectedDates.filter(
      (d) => formatDate(d) !== dateStr,
    );
    setSelectedDates(updatedSelected);
  };

  const handleSave = () => {
    const newDates = selectedDates.map((d) => formatDate(d));
    newDates.sort();
    axios
      .get(`${API_BASE_URL}group_available_dates/?group_id=${groupId}`)
      .then((res) => {
        const existing = res.data[0];
        if (existing) {
          return axios.put(
            `${API_BASE_URL}group_available_dates/${existing.id}/`,
            {
              group_id: groupId,
              dates: newDates,
            },
          );
        } else {
          return axios.post(`${API_BASE_URL}group_available_dates/`, {
            group_id: groupId,
            dates: newDates,
          });
        }
      })
      .then(() => {
        toast.success("Даты успешно сохранены!");
        navigate("/group_available_dates");
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
      <StepsNav currentStep={9} />
      <h1>Доступные даты для группы</h1>
      <p className="text-muted">{groupName}</p>

      <p>
        Выберите даты, в которые группа может проводить занятия. Вы можете
        выбрать сразу несколько дат.
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

      <h3 className="mt-4">Выбранные даты:</h3>
      {selectedDates.length === 0 && <p>Нет выбранных дат</p>}
      <ul className="list-group">
        {selectedDates.map((d) => {
          const ds = formatDate(d);
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

      <div className="mt-3">
        <button className="btn btn-success" onClick={handleSave}>
          Сохранить
        </button>
        <button
          className="btn btn-secondary ms-2"
          onClick={() => navigate("/group_available_dates")}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

export default GroupAvailableDatesForm;
