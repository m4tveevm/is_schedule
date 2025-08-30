import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getBrigadeAssignments,
  bulkDeleteBrigadeAssignments,
} from "../../services/api";
import StepsNav from "../StepsNav";
import { toast } from "react-toastify";

export function BrigadeAssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hasData = useMemo(
    () => Object.keys(grouped || {}).length > 0,
    [grouped]
  );

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await getBrigadeAssignments();
      const list = Array.isArray(data) ? data : [];
      setAssignments(list);

      const g = list.reduce((acc, a) => {
        const key = `${a.group_name}-${a.educational_plan_name}-${a.subject_name}`;
        if (!acc[key]) {
          acc[key] = {
            group_name: a.group_name,
            educational_plan_name: a.educitional_plan_name || a.educational_plan_name,
            subject_name: a.subject_name,
            group_educational_plan: a.group_educational_plan,
            educational_plan_entry: a.educational_plan_entry,
            brigades: [],
          };
        }
        acc[key].brigades.push({
          brigade_number: a.brigade_number,
          teacher_name: a.teacher_name,
        });
        return acc;
      }, {});
      Object.values(g).forEach((v) =>
        v.brigades.sort((x, y) => (x.brigade_number || 0) - (y.brigade_number || 0))
      );
      setGrouped(g);
    } catch (e) {
      console.error(e);
      setError("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(planId, entryId) {
    if (!window.confirm("Удалить все назначения для этой записи?")) return;
    try {
      await bulkDeleteBrigadeAssignments({
        group_educational_plan: planId,
        educational_plan_entry: entryId,
      });
      toast.success("Удалено");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Ошибка удаления");
    }
  }

  return (
    <div className="container">
      <StepsNav currentStep={7} />
      <h1>Назначения бригад</h1>

      <div className="mb-3 d-flex gap-2">
        <Link to="/brigade_assignments/add" className="btn btn-primary">
          Добавить
        </Link>
      </div>

      {loading && <p>Загрузка...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !hasData && (
        <div className="alert alert-info">Нет назначений</div>
      )}

      <div className="row">
        {Object.values(grouped).map((item) => {
          const cardKey = `${item.group_educational_plan}-${item.educational_plan_entry}`;
          return (
            <div key={cardKey} className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{item.subject_name}</h5>
                  <p>
                    <strong>Группа:</strong> {item.group_name}
                  </p>
                  <p>
                    <strong>План:</strong> {item.educational_plan_name}
                  </p>
                  <ul>
                    {(item.brigades || []).map((b) => (
                      <li key={b.brigade_number}>
                        Бригада {b.brigade_number}: {b.teacher_name || "—"}
                      </li>
                    ))}
                  </ul>
                  <div className="d-flex justify-content-end">
                    <button className="btn btn-sm btn-warning me-2" disabled>
                      Изменить
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() =>
                        handleDelete(
                          item.group_educational_plan,
                          item.educational_plan_entry
                        )
                      }
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BrigadeAssignmentList;
