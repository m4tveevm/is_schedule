import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "../../hooks/useQuery";
import {
  getBrigadeAssignmentsBulk,
  getEducationalPlanEntries,
  searchGroupEducationalPlans,
  searchTeachers,
  bulkUpdateBrigadeAssignments,
} from "../../services/api";
import { useAutocomplete } from "../../hooks/useAutocomplete";
import StepsNav from "../StepsNav";
import { toast } from "react-toastify";

function BrigadeAssignmentForm() {
  const query = useQuery();
  const navigate = useNavigate();

  const initialGroupPlan = query.get("group_educational_plan") || "";
  const initialPlanEntry = query.get("educational_plan_entry") || "";

  const [groupEducationalPlan, setGroupEducationalPlan] =
    useState(initialGroupPlan);
  const [educationalPlanEntry, setEducationalPlanEntry] =
    useState(initialPlanEntry);
  const [entries, setEntries] = useState([]);

  const [brigades, setBrigades] = useState([
    {
      brigade_number: 1,
      teacher: "",
      teacherQuery: "",
      teacherSuggestions: [],
      _activeIndex: -1,
    },
    {
      brigade_number: 2,
      teacher: "",
      teacherQuery: "",
      teacherSuggestions: [],
      _activeIndex: -1,
    },
    {
      brigade_number: 3,
      teacher: "",
      teacherQuery: "",
      teacherSuggestions: [],
      _activeIndex: -1,
    },
  ]);

  const groupPlanAutocomplete = useAutocomplete(searchGroupEducationalPlans);

  useEffect(() => {
    if (groupEducationalPlan && educationalPlanEntry) {
      getBrigadeAssignmentsBulk(groupEducationalPlan, educationalPlanEntry)
        .then((response) => {
          const data = response.data;
          const updated = brigades.map((b) => {
            const found = data.find(
              (d) => d.brigade_number === b.brigade_number,
            );
            return found
              ? {
                  ...b,
                  teacher: found.teacher,
                  teacherQuery: found.teacher_name,
                }
              : b;
          });
          setBrigades(updated);
        })
        .catch((error) =>
          console.error("Ошибка при загрузке назначений:", error),
        );

      getEducationalPlanEntries(groupEducationalPlan)
        .then((res) => setEntries(res.data))
        .catch((err) =>
          console.error("Ошибка при загрузке записей плана:", err),
        );
    }
  }, [groupEducationalPlan, educationalPlanEntry]);

  const handleTeacherQueryChange = (event, index) => {
    const value = event.target.value;
    const updated = [...brigades];
    updated[index].teacherQuery = value;
    updated[index].teacher = "";
    setBrigades(updated);

    if (value) {
      searchTeachers(value)
        .then((data) => {
          updated[index].teacherSuggestions = data;
          setBrigades([...updated]);
        })
        .catch((error) =>
          console.error("Ошибка при поиске преподавателей:", error),
        );
    } else {
      updated[index].teacherSuggestions = [];
      setBrigades([...updated]);
    }
  };

  const handleTeacherKeyDown = (event, index) => {
    const updated = [...brigades];
    const { teacherSuggestions, _activeIndex } = updated[index];
    if (!teacherSuggestions || teacherSuggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      updated[index]._activeIndex = Math.min(
        _activeIndex + 1,
        teacherSuggestions.length - 1,
      );
      setBrigades(updated);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      updated[index]._activeIndex = Math.max(_activeIndex - 1, 0);
      setBrigades(updated);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (_activeIndex >= 0) {
        handleSelectTeacher(teacherSuggestions[_activeIndex], index);
      }
    }
  };

  const handleSelectTeacher = (teacherObj, index) => {
    const updated = [...brigades];
    updated[index].teacher = teacherObj.id;
    updated[index].teacherQuery = teacherObj.shortname;
    updated[index].teacherSuggestions = [];
    updated[index]._activeIndex = -1;
    setBrigades(updated);
  };

  const handleSelectGroupPlan = (plan) => {
    setGroupEducationalPlan(plan.id);
    setEducationalPlanEntry("");
    groupPlanAutocomplete.setQuery(
      `${plan.group_name} - ${plan.educational_plan_name}`,
    );
    groupPlanAutocomplete.setSuggestions([]);
    getEducationalPlanEntries(plan.educational_plan)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setEntries(response.data);
        } else {
          setEntries([]);
          console.error("Ожидали массив записей, получили:", response.data);
        }
      })
      .catch((error) =>
        console.error("Ошибка при загрузке записей плана:", error),
      );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const filteredBrigades = brigades.map((b) => ({
      brigade_number: b.brigade_number,
      teacher: b.teacher,
    }));
    const assignmentData = {
      group_educational_plan: parseInt(groupEducationalPlan, 10),
      educational_plan_entry: parseInt(educationalPlanEntry, 10),
      brigades: filteredBrigades,
    };

    bulkUpdateBrigadeAssignments(assignmentData)
      .then(() => {
        toast.success("Назначения сохранены!");
        navigate("/brigade_assignments");
      })
      .catch((error) => {
        console.error("Ошибка при сохранении назначения:", error);
        toast.error("Произошла ошибка при сохранении. Попробуйте снова.");
      });
  };

  return (
    <div className="container mt-4">
      <StepsNav currentStep={7} />
      <h1>
        {groupEducationalPlan && educationalPlanEntry
          ? "Редактировать назначения бригад"
          : "Добавить назначения бригад"}
      </h1>
      {/* Если в режиме добавления, отображаем автодополнение для выбора группы */}
      {!groupEducationalPlan && (
        <div className="form-group mb-3">
          <label>Группа и учебный план</label>
          <input
            type="text"
            className="form-control"
            value={groupPlanAutocomplete.query}
            onChange={(e) =>
              groupPlanAutocomplete.handleQueryChange(e.target.value)
            }
            onKeyDown={(e) =>
              groupPlanAutocomplete.handleKeyDown(e, handleSelectGroupPlan)
            }
            placeholder="Начните вводить..."
            required
          />
          {groupPlanAutocomplete.suggestions.length > 0 && (
            <ul className="list-group">
              {groupPlanAutocomplete.suggestions.map((plan, idx) => (
                <li
                  key={plan.id}
                  className={`list-group-item ${idx === groupPlanAutocomplete.activeIndex ? "active" : ""}`}
                  onMouseDown={() => handleSelectGroupPlan(plan)}
                  style={{ cursor: "pointer" }}
                >
                  {plan.group_name} - {plan.educational_plan_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {groupEducationalPlan && educationalPlanEntry && (
        <div className="mb-3">
          <h5>
            Редактирование назначений для группы {groupEducationalPlan} и записи
            плана {educationalPlanEntry}
          </h5>
        </div>
      )}

      <div className="form-group mb-3">
        <label>Выберите дисциплину / занятие</label>
        <select
          className="form-select"
          value={educationalPlanEntry}
          onChange={(e) => setEducationalPlanEntry(e.target.value)}
          required
          disabled={entries.length === 0}
        >
          <option value="">-- выберите --</option>
          {entries.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.subject_name} ({entry.lesson_type})
            </option>
          ))}
        </select>
      </div>

      <h3 className="mt-4">Назначения для бригады</h3>
      {brigades.map((b, index) => (
        <div key={b.brigade_number} className="mb-3">
          <label className="form-label">Бригада {b.brigade_number}</label>
          <input
            type="text"
            className="form-control"
            value={b.teacherQuery}
            onChange={(e) => handleTeacherQueryChange(e, index)}
            onKeyDown={(e) => handleTeacherKeyDown(e, index)}
            placeholder="Введите имя преподавателя..."
          />
          {b.teacherSuggestions.length > 0 && b.teacherQuery && (
            <ul
              className="list-group position-absolute w-100"
              style={{ zIndex: 999, top: "100%" }}
            >
              {b.teacherSuggestions.map((t, i) => (
                <li
                  key={t.id}
                  className={`list-group-item ${b._activeIndex === i ? "active" : ""}`}
                  onMouseDown={() => handleSelectTeacher(t, index)}
                  style={{ cursor: "pointer" }}
                >
                  {t.shortname}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <div className="d-flex justify-content-end mt-4">
        <button type="submit" className="btn btn-success">
          Сохранить
        </button>
        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={() => navigate("/brigade_assignments")}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

export default BrigadeAssignmentForm;
