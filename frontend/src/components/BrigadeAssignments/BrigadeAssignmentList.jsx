import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getBrigadeAssignments,
  bulkDeleteBrigadeAssignments,
} from "../../services/api";
import StepsNav from "../StepsNav";
import { toast } from "react-toastify";

function BrigadeAssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [groupedAssignments, setGroupedAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getBrigadeAssignments();
      const grouped = groupAssignmentsBySubject(response.data);
      setAssignments(response.data);
      setGroupedAssignments(grouped);
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить назначения бригад.");
    } finally {
      setLoading(false);
    }
  };

  const groupAssignmentsBySubject = (data) => {
    return data.reduce((acc, assignment) => {
      const key = `${assignment.group_name}-${assignment.educational_plan_name}-${assignment.subject_name}`;
      if (!acc[key]) {
        acc[key] = {
          group_name: assignment.group_name,
          educational_plan_name: assignment.educational_plan_name,
          subject_name: assignment.subject_name,
          group_educational_plan: assignment.group_educational_plan,
          educational_plan_entry: assignment.educational_plan_entry,
          brigades: [],
        };
      }
      acc[key].brigades.push({
        brigade_number: assignment.brigade_number,
        teacher_name: assignment.teacher_name,
      });
      return acc;
    }, {});
  };

  const handleDelete = async (groupId, entryId) => {
    if (
      window.confirm(
        "Вы уверены, что хотите удалить все назначения для этой группы и записи?",
      )
    ) {
      try {
        await bulkDeleteBrigadeAssignments({
          group_educational_plan: groupId,
          educational_plan_entry: entryId,
        });
        await loadAssignments();
        toast.success("Назначения удалены.");
      } catch (err) {
        console.error("Ошибка при удалении назначений:", err);
      }
    }
  };

  return (
    <div className="container">
      <StepsNav currentStep={7} />
      <h1>Назначение преподавателей бригадам</h1>
      <p className="text-muted">
        На этом этапе вы связываете преподавателей с бригадами внутри групп,
        основываясь на учебных планах и предметах.
      </p>
      <div className="actions mb-3">
        <Link to="/brigade_assignments/add" className="btn btn-primary">
          Добавить назначение
        </Link>
      </div>
      {loading && <p>Загрузка...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {Object.keys(groupedAssignments).length > 0 ? (
        <div className="row">
          {Object.values(groupedAssignments).map((assignment, index) => (
            <div key={index} className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{assignment.subject_name}</h5>
                  <p className="card-text">
                    <strong>Группа:</strong> {assignment.group_name}
                    <br />
                    <strong>План:</strong> {assignment.educational_plan_name}
                  </p>
                  <p>
                    <strong>Бригады:</strong>
                    <ul className="list-unstyled">
                      {assignment.brigades.map((brigade) => (
                        <li key={brigade.brigade_number}>
                          Бригада {brigade.brigade_number}:{" "}
                          {brigade.teacher_name || "Не назначен"}
                        </li>
                      ))}
                    </ul>
                  </p>
                  <div className="d-flex justify-content-end">
                    {/*<Link*/}
                    {/*  to={`/brigade_assignments/edit?group_educational_plan=${assignment.group_educational_plan}&educational_plan_entry=${assignment.educational_plan_entry}`}*/}
                    {/*  className="btn btn-sm btn-warning me-2"*/}
                    {/*  disabled*/}
                    {/*>*/}
                    {/*  Изменить*/}
                    {/*</Link>*/}
                    <button className="btn btn-sm btn-warning me-2" disabled>
                      Изменить
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() =>
                        handleDelete(
                          assignment.group_educational_plan,
                          assignment.educational_plan_entry,
                        )
                      }
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="alert alert-info">
            Назначения отсутствуют. Добавьте новое назначение.
          </div>
        )
      )}
    </div>
  );
}

export default BrigadeAssignmentList;
