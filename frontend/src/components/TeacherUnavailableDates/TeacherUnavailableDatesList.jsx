import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StepsNav from "../StepsNav";
import { searchTeachers } from "../../services/api";
import { toast } from "react-toastify";

function TeacherUnavailableDatesList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = () => {
    setLoading(true);
    setError(null);
    searchTeachers(searchTerm)
      .then((data) => {
        const sorted = data.sort((a, b) => a.surname.localeCompare(b.surname));
        setTeachers(sorted);
      })
      .catch((err) => {
        console.error(err);
        setError("Не удалось загрузить преподавателей.");
        toast.error("Не удалось загрузить преподавателей.");
      })
      .finally(() => setLoading(false));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    loadTeachers();
  };

  return (
    <div className="container">
      <StepsNav currentStep={8} />
      <h1>Недоступные даты преподавателей</h1>
      <p className="text-muted">
        Здесь вы можете посмотреть преподавателей и отредактировать периоды, в
        которые они недоступны.
      </p>
      <div className="actions mb-3 d-flex align-items-center">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Поиск по фамилии"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ width: "200px" }}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          Поиск
        </button>
      </div>
      {loading && <p>Загрузка...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && teachers.length === 0 && (
        <div className="alert alert-info">Преподаватели не найдены.</div>
      )}
      <div className="row">
        {teachers.map((t) => (
          <div key={t.id} className="col-md-4">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">
                  {t.surname} {t.name} {t.lastname}
                </h5>
                <p className="card-text">Тип: {t.employer_type}</p>
                <Link
                  to={`/teacher_unavailable_dates/${t.id}/edit`}
                  className="btn btn-sm btn-warning"
                >
                  Изменить недоступные даты
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeacherUnavailableDatesList;
