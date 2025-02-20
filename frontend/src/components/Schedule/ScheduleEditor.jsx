import React, { useState, useEffect } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Russian } from "flatpickr/dist/l10n/ru.js";
import { getGroups, getTeachers, createLecture } from "../../services/api";
import { useNavigate } from "react-router-dom";

function ScheduleEditor() {
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [errorFields, setErrorFields] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    getGroups()
      .then((response) => setGroups(response.data))
      .catch((error) => console.error("Ошибка при загрузке групп:", error));

    getTeachers()
      .then((response) => setTeachers(response.data))
      .catch((error) =>
        console.error("Ошибка при загрузке преподавателей:", error),
      );
  }, []);

  const addAssignment = () => {
    setAssignments((prev) => [
      ...prev,
      {
        date: "",
        time_slot: "morning",
        group: "",
        brigades: [
          { number: 1, teacher_id: "" },
          { number: 2, teacher_id: "" },
          { number: 3, teacher_id: "" },
        ],
      },
    ]);
  };

  const removeAssignment = (index) => {
    setAssignments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const validateAssignment = (assignment, index) => {
    const errors = {};
    if (!assignment.date) errors.date = "Выберите дату";
    if (!assignment.group) errors.group = "Выберите группу";

    const usedTeachers = new Set();
    assignment.brigades.forEach((brigade) => {
      if (brigade.teacher_id) {
        if (usedTeachers.has(brigade.teacher_id)) {
          errors[`brigade_${brigade.number}`] =
            `Преподаватель уже назначен для другой бригады`;
        } else {
          usedTeachers.add(brigade.teacher_id);
        }
      }
    });

    setErrorFields((prev) => ({ ...prev, [index]: errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = assignments.every((assignment, index) =>
      validateAssignment(assignment, index),
    );

    if (!isValid) return;

    const lectureResults = [];

    for (const assignment of assignments) {
      const { date, time_slot, group, brigades } = assignment;

      for (const brigade of brigades) {
        if (!brigade.teacher_id) {
          continue;
        }

        try {
          await createLecture({
            schedule_date: { date },
            time_slot,
            group: { id: group },
            brigade_number: brigade.number,
            teacher: { id: brigade.teacher_id },
          });
        } catch (error) {
          console.error(`Ошибка для бригады ${brigade.number}:`, error);
          lectureResults.push({
            status: "error",
            assignment,
            brigadeNumber: brigade.number,
            errorMessage: "Преподаватель занят или другая ошибка.",
          });
        }
      }
    }

    if (lectureResults.length > 0) {
      const updatedErrors = {};
      lectureResults.forEach(({ assignment, brigadeNumber, errorMessage }) => {
        const assignmentIndex = assignments.indexOf(assignment);
        updatedErrors[assignmentIndex] = {
          ...updatedErrors[assignmentIndex],
          [`brigade_${brigadeNumber}`]: errorMessage,
        };
      });
      setErrorFields(updatedErrors);
      return;
    }
    navigate("/schedule/success");
  };

  const getAvailableTeachers = (assignmentIndex, brigadeNumber) => {
    const assignment = assignments[assignmentIndex];
    const { brigades } = assignment;

    const busyTeachers = new Set(
      brigades
        .filter((b) => b.number !== brigadeNumber && b.teacher_id)
        .map((b) => b.teacher_id),
    );

    return teachers.filter((teacher) => !busyTeachers.has(teacher.id));
  };

  return (
    <div>
      <h1>Редактор расписания</h1>
      <form onSubmit={handleSubmit}>
        {assignments.map((assignment, index) => (
          <div key={index} className="card mb-4">
            <div className="card-header">
              <span>Элемент расписания {index + 1}</span>
              <button
                type="button"
                className="btn btn-danger btn-sm float-right"
                onClick={() => removeAssignment(index)}
              >
                Удалить
              </button>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label>Дата</label>
                <Flatpickr
                  options={{
                    dateFormat: "Y-m-d",
                    locale: Russian,
                  }}
                  value={assignment.date}
                  onChange={(dates) => {
                    const date = dates[0]?.toLocaleDateString("en-CA") || "";
                    setAssignments((prev) =>
                      prev.map((item, idx) =>
                        idx === index
                          ? {
                              ...item,
                              date,
                            }
                          : item,
                      ),
                    );
                  }}
                  className={`form-control ${
                    errorFields[index]?.date ? "is-invalid" : ""
                  }`}
                />
                {errorFields[index]?.date && (
                  <div className="invalid-feedback">
                    {errorFields[index].date}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Группа</label>
                <select
                  className={`form-control ${
                    errorFields[index]?.group ? "is-invalid" : ""
                  }`}
                  value={assignment.group}
                  onChange={(e) => {
                    const group = e.target.value;
                    setAssignments((prev) =>
                      prev.map((item, idx) =>
                        idx === index
                          ? {
                              ...item,
                              group,
                            }
                          : item,
                      ),
                    );
                  }}
                >
                  <option value="">-- Выберите группу --</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                {errorFields[index]?.group && (
                  <div className="invalid-feedback">
                    {errorFields[index].group}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Время</label>
                <select
                  className="form-control"
                  value={assignment.time_slot}
                  onChange={(e) => {
                    const time_slot = e.target.value;
                    setAssignments((prev) =>
                      prev.map((item, idx) =>
                        idx === index
                          ? {
                              ...item,
                              time_slot,
                            }
                          : item,
                      ),
                    );
                  }}
                >
                  <option value="morning">Утро</option>
                  <option value="evening">Вечер</option>
                </select>
              </div>
              {assignment.brigades.map((brigade) => (
                <div className="form-group" key={brigade.number}>
                  <label>Преподаватель для бригады {brigade.number}</label>
                  <select
                    className={`form-control ${
                      errorFields[index]?.[`brigade_${brigade.number}`]
                        ? "is-invalid"
                        : ""
                    }`}
                    value={brigade.teacher_id}
                    onChange={(e) => {
                      const teacher_id = e.target.value;
                      setAssignments((prev) =>
                        prev.map((item, idx) =>
                          idx === index
                            ? {
                                ...item,
                                brigades: item.brigades.map((b) =>
                                  b.number === brigade.number
                                    ? {
                                        ...b,
                                        teacher_id,
                                      }
                                    : b,
                                ),
                              }
                            : item,
                        ),
                      );
                    }}
                  >
                    <option value="">-- Выберите преподавателя --</option>
                    {getAvailableTeachers(index, brigade.number).map(
                      (teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ),
                    )}
                  </select>
                  {errorFields[index]?.[`brigade_${brigade.number}`] && (
                    <div className="invalid-feedback">
                      {errorFields[index][`brigade_${brigade.number}`]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={addAssignment}
        >
          Добавить элемент
        </button>
        <button type="submit" className="btn btn-primary ml-3">
          Сохранить
        </button>
      </form>
    </div>
  );
}

export default ScheduleEditor;
