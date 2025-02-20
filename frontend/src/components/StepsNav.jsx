import React from "react";
import { NavLink } from "react-router-dom";

function StepsNav({ currentStep }) {
  const steps = [
    { step: 1, title: "Импорт преподавателей", path: "/teachers" },
    { step: 2, title: "Группы", path: "/groups" },
    { step: 3, title: "Предметы", path: "/subjects" },
    {
      step: 4,
      title: "Назначения дисциплин преподавателям",
      path: "/teacher_subject_assignments",
    },
    { step: 5, title: "Учебные планы", path: "/educational_plans" },
    {
      step: 6,
      title: "Привязка планов к группам",
      path: "/group_educational_plans",
    },
    { step: 7, title: "Назначения бригад", path: "/brigade_assignments" },
    {
      step: 8,
      title: "Выбор недоступных дат для преподавателей",
      path: "/teacher_unavailable_dates",
    },
    {
      step: 9,
      title: "Выбор доступных дат для группы",
      path: "/group_available_dates",
    },
    {
      step: 10,
      title: "Представление календаря для группы",
      path: "/group_calendar",
    },
  ];

  return (
    <div className="steps-nav">
      <div className="d-none d-md-flex">
        {steps.map((s) => (
          <NavLink
            key={s.step}
            to={s.path}
            className={`step-item ${currentStep === s.step ? "active" : ""}`}
          >
            {s.step}
          </NavLink>
        ))}
      </div>

      <div className="d-flex d-md-none flex-column align-items-center">
        <div className="mb-2">
          <strong>
            Шаг {currentStep} из {steps.length}
          </strong>
          : {steps.find((s) => s.step === currentStep)?.title}
        </div>
        <div className="progress" style={{ width: "100%" }}>
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
            aria-valuenow={currentStep}
            aria-valuemin="0"
            aria-valuemax={steps.length}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default StepsNav;
