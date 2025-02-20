import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StepsNav from "../StepsNav";
import axios from "axios";
import { API_BASE_URL } from "../../services/api";
import { toast } from "react-toastify";

function GroupAvailableDatesList() {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = () => {
    setLoading(true);
    setError(null);
    axios
      .get(`${API_BASE_URL}groups/?search=${encodeURIComponent(searchTerm)}`)
      .then((res) => {
        const sorted = res.data.sort((a, b) => a.name.localeCompare(b.name));
        setGroups(sorted);
      })
      .catch((err) => {
        console.error(err);
        setError("Не удалось загрузить группы. Попробуйте позже.");
        toast.error("Не удалось загрузить группы. Попробуйте позже.");
      })
      .finally(() => setLoading(false));
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSearch = () => loadGroups();

  return (
    <div className="container">
      <StepsNav currentStep={9} />
      <h1>Доступные даты для групп</h1>
      <p className="text-muted">
        Выберите группу и отредактируйте периоды, в которые она может проводить
        занятия.
      </p>
      <div className="actions mb-3 d-flex align-items-center">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Поиск по группе"
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
      {!loading && !error && groups.length === 0 && (
        <div className="alert alert-info">Группы не найдены.</div>
      )}
      <div className="row">
        {groups.map((g) => (
          <div key={g.id} className="col-md-4">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">{g.name}</h5>
                <Link
                  to={`/group_available_dates/${g.id}/edit`}
                  className="btn btn-sm btn-warning"
                >
                  Изменить доступные даты
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GroupAvailableDatesList;
