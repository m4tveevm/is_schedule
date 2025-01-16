import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    getBrigadeAssignmentById,
    getEducationalPlanEntries,
    searchGroupEducationalPlans,
    searchTeachers,
    bulkUpdateBrigadeAssignments,
} from '../../services/api';
import {useAutocomplete} from '../../hooks/useAutocomplete';
import StepsNav from '../StepsNav';

function BrigadeAssignmentForm() {
    const {id: compositeId} = useParams();
    const navigate = useNavigate();

    const [groupEducationalPlan, setGroupEducationalPlan] = useState('');
    const [educationalPlanEntry, setEducationalPlanEntry] = useState('');
    const [entries, setEntries] = useState([]);

    const [brigades, setBrigades] = useState([
        {
            brigade_number: 1,
            teacher: '',
            teacherQuery: '',
            teacherSuggestions: [],
            _activeIndex: -1,
        },
        {
            brigade_number: 2,
            teacher: '',
            teacherQuery: '',
            teacherSuggestions: [],
            _activeIndex: -1,
        },
        {
            brigade_number: 3,
            teacher: '',
            teacherQuery: '',
            teacherSuggestions: [],
            _activeIndex: -1,
        },
    ]);

    const groupPlanAutocomplete = useAutocomplete(searchGroupEducationalPlans);

    useEffect(() => {
        if (compositeId) {
            const [groupEducationalPlanId, educationalPlanEntryId, brigadeNumber] = compositeId.split('-');
            getBrigadeAssignmentById(compositeId)
                .then(data => {
                    setGroupEducationalPlan(groupEducationalPlanId);
                    setEducationalPlanEntry(educationalPlanEntryId);

                    const planId = data.group_educational_plan.educational_plan;
                    getEducationalPlanEntries(planId)
                        .then(entriesData => {
                            setEntries(entriesData);
                        })
                        .catch(err => console.error('Ошибка при загрузке записей плана:', err));

                    setBrigades(prev =>
                        prev.map(brigade =>
                            brigade.brigade_number === parseInt(brigadeNumber, 10)
                                ? {
                                    ...brigade,
                                    teacher: data.teacher,
                                    teacherQuery: data.teacher_name,
                                }
                                : brigade
                        )
                    );
                })
                .catch(error => console.error('Ошибка при загрузке назначения:', error));
        }
    }, [compositeId]);

    const handleSelectGroupPlan = (plan) => {
        setGroupEducationalPlan(plan.id);
        setEducationalPlanEntry('');
        groupPlanAutocomplete.setQuery(`${plan.group_name} - ${plan.educational_plan_name}`);
        groupPlanAutocomplete.setSuggestions([]);
        getEducationalPlanEntries(plan.educational_plan)
            .then(response => {
                if (Array.isArray(response.data)) {
                    setEntries(response.data);
                } else {
                    console.error('Ожидали массив, получили:', response.data);
                    setEntries([]);
                }
            })
            .catch(error => console.error('Ошибка при загрузке записей плана:', error));
    };

    const handleTeacherQueryChange = (event, index) => {
        const value = event.target.value;
        const updated = [...brigades];
        updated[index].teacherQuery = value;
        updated[index].teacher = '';
        setBrigades(updated);

        if (value) {
            searchTeachers(value)
                .then(data => {
                    updated[index].teacherSuggestions = data;
                    setBrigades([...updated]);
                })
                .catch(error => console.error('Ошибка при поиске преподавателей:', error));
        } else {
            updated[index].teacherSuggestions = [];
            setBrigades([...updated]);
        }
    };

    const handleTeacherKeyDown = (event, index) => {
        const updated = [...brigades];
        const {teacherSuggestions, _activeIndex} = updated[index];

        if (!teacherSuggestions || teacherSuggestions.length === 0) return;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            updated[index]._activeIndex = Math.min(_activeIndex + 1, teacherSuggestions.length - 1);
            setBrigades(updated);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            updated[index]._activeIndex = Math.max(_activeIndex - 1, 0);
            setBrigades(updated);
        } else if (event.key === 'Enter') {
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
    const handleSubmit = (event) => {
        event.preventDefault();
        const filteredBrigades = brigades.filter(b => b.teacher);
        const assignmentData = {
            group_educational_plan: parseInt(groupEducationalPlan, 10),
            educational_plan_entry: parseInt(educationalPlanEntry, 10),
            brigades: filteredBrigades.map(b => ({
                brigade_number: b.brigade_number,
                teacher: b.teacher,
            })),
        };

        bulkUpdateBrigadeAssignments(assignmentData)
            .then(() => navigate('/brigade_assignments'))
            .catch(error => {
                console.error('Ошибка при сохранении назначения:', error);
                alert('Произошла ошибка при сохранении назначения. Попробуйте снова.');
            });
    };

    return (
        <div className="container mt-4">
            <StepsNav currentStep={5}/>
            <h1>{compositeId ? 'Редактировать назначения бригад' : 'Добавить назначения бригад'}</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                    <label>Группа и учебный план</label>
                    <input
                        type="text"
                        className="form-control"
                        value={groupPlanAutocomplete.query}
                        onChange={(e) => groupPlanAutocomplete.handleQueryChange(e.target.value)}
                        onKeyDown={(e) => groupPlanAutocomplete.handleKeyDown(e, handleSelectGroupPlan)}
                        placeholder="Начните вводить..."
                        required
                    />
                    {groupPlanAutocomplete.suggestions.length > 0 && (
                        <ul className="list-group">
                            {groupPlanAutocomplete.suggestions.map((plan, idx) => (
                                <li
                                    key={plan.id}
                                    className={`list-group-item ${idx === groupPlanAutocomplete.activeIndex ? 'active' : ''}`}
                                    onMouseDown={() => handleSelectGroupPlan(plan)}
                                    style={{cursor: 'pointer'}}
                                >
                                    {plan.group_name} - {plan.educational_plan_name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

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


                <h3 className="mt-4">Назначения для бригад</h3>
                {brigades.map((b, index) => (
                    <div key={b.brigade_number} className="mb-3 position-relative">
                        <label className="form-label">
                            Бригада {b.brigade_number} (поиск преподавателя)
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            value={b.teacherQuery}
                            onChange={(e) => handleTeacherQueryChange(e, index)}
                            onKeyDown={(e) => handleTeacherKeyDown(e, index)}
                            placeholder="Оставьте пустым, чтобы не назначать"
                        />
                        {b.teacherSuggestions.length > 0 && b.teacherQuery && (
                            <ul className="list-group position-absolute w-100" style={{zIndex: 999, top: '100%'}}>
                                {b.teacherSuggestions.map((t, i) => (
                                    <li
                                        key={t.id}
                                        className={`list-group-item ${b._activeIndex === i ? 'active' : ''}`}
                                        onMouseDown={() => handleSelectTeacher(t, index)}
                                        style={{cursor: 'pointer'}}
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
                        onClick={() => navigate('/brigade_assignments')}
                    >
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
}

export default BrigadeAssignmentForm;