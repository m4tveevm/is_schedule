import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import StepsNav from "../StepsNav";
import { API_BASE_URL } from "../../services/api";
import { toast } from "react-toastify";
import AddLessonForm from "./AddLessonForm";

function GroupCalendar() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(null);
  const [schedule, setSchedule] = useState({});
  const [activeDate, setActiveDate] = useState(null);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`${API_BASE_URL}groups/${groupId}/`),
      axios.get(`${API_BASE_URL}groups/${groupId}/available_dates/`),
      axios.get(
        `${API_BASE_URL}educational_plans/remaining?group_id=${groupId}`,
      ),
    ])
      .then(([groupRes, datesRes, planRes]) => {
        setGroupName(groupRes.data.name);
        setAvailableDates(datesRes.data.dates || []);
        setPlan(planRes.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Не удалось загрузить данные.");
        toast.error("Не удалось загрузить данные.");
      })
      .finally(() => setLoading(false));
  }, [groupId]);

  const handleAddLesson = ({ lessonType, teacher, date }) => {
    const currentDayLessons = schedule[date] ? [...schedule[date]] : [];
    currentDayLessons.push({
      teacher_id: teacher.id,
      teacher_name: teacher.shortname,
      lessonType,
    });
    setSchedule({ ...schedule, [date]: currentDayLessons });

    setPlan((prevPlan) => ({
      ...prevPlan,
      [lessonType]: prevPlan[lessonType] - 1,
    }));

    setActiveDate(null);
    toast.success("Занятие добавлено");
  };

  const handleRemoveLesson = (date, index) => {
    const currentDayLessons = schedule[date] ? [...schedule[date]] : [];
    const removedLesson = currentDayLessons.splice(index, 1)[0];
    setSchedule({ ...schedule, [date]: currentDayLessons });
    setPlan((prevPlan) => ({
      ...prevPlan,
      [removedLesson.lessonType]: prevPlan[removedLesson.lessonType] + 1,
    }));
    toast.info("Занятие удалено");
  };

  const handleSaveAll = () => {
    const requests = [];
    for (const date in schedule) {
      schedule[date].forEach((lesson) => {
        requests.push(
          axios.post(`${API_BASE_URL}schedule/`, {
            group_id: Number(groupId),
            date,
            teacher_id: lesson.teacher_id,
            lessonType: lesson.lessonType,
          }),
        );
      });
    }
    Promise.all(requests)
      .then(() => {
        toast.success("Расписание сохранено!");
        navigate("/group_calendar");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Ошибка при сохранении расписания.");
      });
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!plan) return <p>Загрузка плана...</p>;

  return (
    <div className="container">
      <StepsNav currentStep={10} />
      <h1>Календарь для группы {groupName}</h1>
      <Link to="/group_calendar" className="btn btn-link mb-3">
        ← Вернуться к списку групп
      </Link>

      <p className="text-muted">
        Ниже отображены доступные для занятий даты. Кликните по дате, чтобы
        добавить занятие.
      </p>

      <div className="table-responsive">
        <table className="table table-bordered text-center">
          <thead>
            <tr>
              {availableDates.map((d) => (
                <th key={d}>{formatDate(d)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {availableDates.map((d) => {
                const lessons = schedule[d] || [];
                const busyTeacherIds = lessons.map(
                  (lesson) => lesson.teacher_id,
                );
                return (
                  <td key={d} style={{ verticalAlign: "top" }}>
                    {activeDate === d ? (
                      <AddLessonForm
                        date={d}
                        plan={plan}
                        onAdd={handleAddLesson}
                        onCancel={() => setActiveDate(null)}
                        busyTeachers={busyTeacherIds}
                      />
                    ) : (
                      <button
                        className="btn btn-sm btn-primary mb-2"
                        onClick={() => setActiveDate(d)}
                      >
                        Добавить занятие
                      </button>
                    )}

                    {lessons.length === 0 && (
                      <div className="text-muted">Нет занятий</div>
                    )}
                    {lessons.map((lesson, i) => (
                      <div
                        key={i}
                        className="d-flex justify-content-between align-items-center mb-1"
                      >
                        <span>
                          {lesson.lessonType} - {lesson.teacher_name}
                        </span>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRemoveLesson(d, i)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="mt-4">Остаток нагрузки:</h3>
      <ul>
        <li>УП: {plan["УП"]}</li>
        <li>КЛ: {plan["КЛ"]}</li>
        <li>ДК: {plan["ДК"]}</li>
      </ul>

      <button className="btn btn-success" onClick={handleSaveAll}>
        Сохранить расписание
      </button>
    </div>
  );
}

export default GroupCalendar;
