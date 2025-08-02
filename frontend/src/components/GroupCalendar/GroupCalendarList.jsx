import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import StepsNav from "../StepsNav";
import { API_BASE_URL } from "../../services/api";
import { toast } from "react-toastify";

function GroupCalendarList() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loads, setLoads] = useState({});

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}groups/`)
      .then((res) => {
        setGroups(res.data);
        return res.data;
      })
      .then((groupsData) => {
        const requests = groupsData.map((g) =>
          axios
            .get(`${API_BASE_URL}educational_plans/remaining?group_id=${g.id}`)
            .then((resp) => ({
              groupId: g.id,
              data: resp.data,
            }))
            .catch(() => null),
        );
        return Promise.all(requests);
      })
      .then((arr) => {
        const loadObj = {};
        arr.forEach((item) => {
          if (item) {
            loadObj[item.groupId] = item.data;
          }
        });
        setLoads(loadObj);
      })
      .catch((err) => {
        console.error(err);
        setError("Не удалось загрузить список групп");
        toast.error("Не удалось загрузить список групп");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <StepsNav currentStep={10} />
      <h1>Список групп</h1>
      <p className="text-muted">
        Выберите группу, чтобы открыть календарь расписания и назначить занятия.
      </p>

      {loading && <p>Загрузка...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {groups.length === 0 && <div>Нет групп.</div>}

      <div className="row">
        {groups.map((g) => {
          const loadInfo = loads[g.id] || { УП: 0, КЛ: 0, ДК: 0 };
          const isCalendarAvailable =
            loadInfo["УП"] !== 0 ||
            loadInfo["КЛ"] !== 0 ||
            loadInfo["ДК"] !== 0;
          return (
            <div key={g.id} className="col-md-4">
              <div className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">{g.name}</h5>
                  <p className="card-text">
                    Остаток: УП {loadInfo["УП"] || 0} / КЛ {loadInfo["КЛ"] || 0}{" "}
                    / ДК {loadInfo["ДК"] || 0}
                  </p>
                  {isCalendarAvailable ? (
                    <Link
                      to={`/group_calendar/${g.id}`}
                      className="btn btn-primary"
                    >
                      Открыть календарь
                    </Link>
                  ) : (
                    <div className="alert alert-info p-2">
                      На данный момент календарь недоступен, так как для группы
                      не назначен учебный план или нет доступных дат занятий.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GroupCalendarList;
