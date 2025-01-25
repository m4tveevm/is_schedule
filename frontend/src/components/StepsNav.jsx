import React from 'react';
import {NavLink} from 'react-router-dom';


function StepsNav({currentStep}) {
    const steps = [
        {step: 1, title: 'Импорт преподавателей', path: '/teachers'},
        {step: 2, title: 'Группы', path: '/groups'},
        {step: 3, title: 'Предметы', path: '/subjects'},
        {step: 4, title: 'Назначения дисциплин преподавателям', path: '/teacher_subject_assignments'},
        {step: 5, title: 'Учебные планы', path: '/educational_plans'},
        {step: 6, title: 'Привязка планов к группам', path: '/group_educational_plans'},
        {step: 7, title: 'Назначения бригад', path: '/brigade_assignments'},
        {step: 8, title: 'Выбор недоступных дат для преподавателей', path: '/teacher_unavailable_dates'},
        {step: 9, title: 'Выбор доступных дат для группы', path: '/group_available_dates'},
        {step: 10, title: 'Представление календаря для группы', path: '/group_calendar'},

    ];

    return (
        <div className="steps-nav">
            {steps.map(s => (
                <NavLink key={s.step} to={s.path} className={`step-item ${currentStep === s.step ? 'active' : ''}`}>
                    {s.step}
                </NavLink>
            ))}
        </div>
    );
}

export default StepsNav;