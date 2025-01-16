import React, {useState, useEffect} from 'react';
import axios from 'axios';
import StepsNav from '../StepsNav';
import {useParams, Link} from 'react-router-dom';
import {API_BASE_URL} from '../../services/api';


function AddLessonForm({date, plan, onCancel, onAdd}) {
    const [lessonType, setLessonType] = useState('');
    const [teacherQuery, setTeacherQuery] = useState('');
    const [teacherSuggestions, setTeacherSuggestions] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        if (!teacherQuery) {
            setTeacherSuggestions([]);
            setSelectedTeacher(null);
            return;
        }
        axios
            .get(`${API_BASE_URL}teachers/?search=${encodeURIComponent(teacherQuery)}`)
            .then((res) => {
                setTeacherSuggestions(res.data);
            })
            .catch((err) => console.error(err));
    }, [teacherQuery]);

    const handleSelectTeacher = (t) => {
        setSelectedTeacher(t);
        setTeacherQuery(t.shortname);
        setTeacherSuggestions([]);
    };

    const handleSubmit = () => {
        if (!lessonType) {
            alert('Выберите тип занятия!');
            return;
        }
        if (!selectedTeacher) {
            alert('Выберите преподавателя!');
            return;
        }
        if (plan[lessonType] <= 0) {
            alert(`По типу ${lessonType} больше нет доступных часов!`);
            return;
        }

        setIsChecking(true);

        axios
            .get(`${API_BASE_URL}teacher_unavailable_dates?teacher_id=${selectedTeacher.id}`)
            .then((res) => {
                const unavailable = res.data[0];
                if (unavailable && unavailable.dates.includes(date)) {
                    alert('Преподаватель недоступен в эту дату');
                } else {
                    onAdd({lessonType, teacher: selectedTeacher, date});
                }
            })
            .catch((err) => {
                console.error(err);
                alert('Ошибка при проверке занятости преподавателя');
            })
            .finally(() => setIsChecking(false));
    };

    return (
        <div className="border p-2 mb-2">
            <h5>Добавить занятие на {date}</h5>

            <label>Тип занятия:</label>
            <select
                className="form-control mb-2"
                value={lessonType}
                onChange={(e) => setLessonType(e.target.value)}
            >
                <option value="">-- Выберите --</option>
                {['УП', 'КЛ', 'ДК'].map((lt) => (
                    <option key={lt} value={lt} disabled={plan[lt] <= 0}>
                        {lt} (осталось {plan[lt]} ч)
                    </option>
                ))}
            </select>

            <label>Поиск преподавателя:</label>
            <input
                type="text"
                className="form-control mb-2"
                placeholder="Фамилия, имя, отчество..."
                value={teacherQuery}
                onChange={(e) => setTeacherQuery(e.target.value)}
            />
            {teacherSuggestions.length > 0 && (
                <ul className="list-group mb-2">
                    {teacherSuggestions.map((t) => (
                        <li
                            key={t.id}
                            className="list-group-item"
                            style={{cursor: 'pointer'}}
                            onMouseDown={() => handleSelectTeacher(t)}
                        >
                            {t.surname} {t.name} {t.lastname} ({t.shortname})
                        </li>
                    ))}
                </ul>
            )}

            <div className="d-flex gap-2">
                <button className="btn btn-success" onClick={handleSubmit}
                        disabled={isChecking}>
                    {isChecking ? 'Проверка...' : 'Добавить'}
                </button>
                <button className="btn btn-secondary" onClick={onCancel}>
                    Отмена
                </button>
            </div>
        </div>
    );
}

function GroupCalendar() {
    const {id: groupId} = useParams();
    const [groupName, setGroupName] = useState('');
    const [availableDates, setAvailableDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [plan, setPlan] = useState(null);

    const [schedule, setSchedule] = useState({});

    const [activeDate, setActiveDate] = useState(null);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit'
        });
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([
            axios.get(`${API_BASE_URL}groups/${groupId}/`),
            axios.get(`${API_BASE_URL}groups/${groupId}/available_dates/`),
            axios.get(`${API_BASE_URL}educational_plans/remaining?group_id=${groupId}`)
        ])
            .then(([groupRes, datesRes, planRes]) => {
                setGroupName(groupRes.data.name);
                setAvailableDates(datesRes.data.dates || []);
                setPlan(planRes.data);
            })
            .catch((err) => {
                console.error(err);
                setError('Не удалось загрузить данные.');
            })
            .finally(() => setLoading(false));
    }, [groupId]);


    const handleAddLesson = ({lessonType, teacher, date}) => {
        const currentDayLessons = schedule[date] || [];
        currentDayLessons.push({
            teacher_id: teacher.id,
            teacher_name: teacher.shortname,
            lessonType
        });
        setSchedule({...schedule, [date]: currentDayLessons});

        const updatedPlan = {...plan};
        updatedPlan[lessonType] -= 1;
        setPlan(updatedPlan);

        setActiveDate(null);
    };

    const handleRemoveLesson = (date, index) => {
        const currentDayLessons = [...(schedule[date] || [])];
        const removedLesson = currentDayLessons.splice(index, 1)[0];
        setSchedule({...schedule, [date]: currentDayLessons});

        const updatedPlan = {...plan};
        updatedPlan[removedLesson.lessonType] += 1;
        setPlan(updatedPlan);
    };

    const handleSaveAll = () => {
        const requests = [];
        for (const date in schedule) {
            schedule[date].forEach((lesson) => {
                requests.push(
                    axios.post(`${API_BASE_URL}schedule/`, {
                        group_id: Number(groupId),
                        date,
                        teacher_id: lesson.teacher_id,
                        lessonType: lesson.lessonType
                    })
                );
            });
        }
        Promise.all(requests)
            .then(() => {
                alert('Расписание сохранено!');
            })
            .catch((err) => {
                console.error(err);
                alert('Ошибка при сохранении расписания.');
            });
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!plan) return <p>Загрузка плана...</p>;

    return (
        <div className="container">
            <StepsNav currentStep={10}/>
            <h1>Календарь для группы {groupName}</h1>
            <Link to="/group_calendar" className="btn btn-link mb-3">
                ← Вернуться к списку групп
            </Link>

            <p className="text-muted">
                Ниже отображены доступные для занятий даты. Кликните по дате,
                чтобы добавить занятие.
            </p>

            <div className="table-responsive">
                <table className="table table-bordered text-center">
                    <thead>
                    <tr>
                        {availableDates.map((d) => (
                            <th key={d}>{formatDate(d)}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        {availableDates.map((d) => {
                            const lessons = schedule[d] || [];
                            return (
                                <td key={d} style={{verticalAlign: 'top'}}>
                                    {activeDate === d ? (
                                        <AddLessonForm
                                            date={d}
                                            plan={plan}
                                            onAdd={handleAddLesson}
                                            onCancel={() => setActiveDate(null)}
                                        />
                                    ) : (
                                        <button
                                            className="btn btn-sm btn-primary mb-2"
                                            onClick={() => setActiveDate(d)}
                                        >
                                            Добавить занятие
                                        </button>
                                    )}

                                    {lessons.length === 0 &&
                                        <div className="text-muted">Нет
                                            занятий</div>}
                                    {lessons.map((lesson, i) => (
                                        <div
                                            key={i}
                                            className="d-flex justify-content-between align-items-center mb-1"
                                        >
                        <span>
                          {lesson.lessonType} - {lesson.teacher_name}
                        </span>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleRemoveLesson(d, i)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </td>
                            );
                        })}
                    </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="mt-4">Остаток нагрузки:</h3>
            <ul>
                <li>УП: {plan['УП']}</li>
                <li>КЛ: {plan['КЛ']}</li>
                <li>ДК: {plan['ДК']}</li>
            </ul>

            <button className="btn btn-success" onClick={handleSaveAll}>
                Сохранить расписание
            </button>
        </div>
    );
}

export default GroupCalendar;