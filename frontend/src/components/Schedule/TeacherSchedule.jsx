import { useState, useEffect } from "react";
import { getTeachers } from "../../services/api";

function TeacherSchedule() {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = () => {
    getTeachers()
      .then((response) => {
        if (Array.isArray(response.data)) {
          setTeachers(response.data);
        } else {
          throw new Error("Некорректный формат данных");
        }
      })
      .catch((error) => {
        console.error("Ошибка при загрузке преподавателей:", error);
        setError("Не удалось загрузить список преподавателей.");
      });
  };

  const handleTeacherChange = (e) => {
    setSelectedTeacher(e.target.value);
  };

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <h1>Расписание преподавателя</h1>
      <form>
        <div className="form-group">
          <label>Выберите преподавателя:</label>
          <select
            className="form-control"
            value={selectedTeacher}
            onChange={handleTeacherChange}
          >
            <option value="">-- Выберите преподавателя --</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.shortname}
              </option>
            ))}
          </select>
        </div>
      </form>
    </div>
  );
}

export default TeacherSchedule;
