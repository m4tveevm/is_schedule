import React, {useState, useEffect} from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_blue.css';
import {Russian} from 'flatpickr/dist/l10n/ru.js';
import {useParams, useNavigate} from 'react-router-dom';
import StepsNav from '../StepsNav';
import axios from 'axios';
import {
    API_BASE_URL
} from '../../services/api';

function TeacherUnavailableDatesForm() {
    const {id: teacherId} = useParams();
    const navigate = useNavigate();
    const [teacherName, setTeacherName] = useState('');
    const [dates, setDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDates, setSelectedDates] = useState([]);

    useEffect(() => {
        Promise.all([
            axios.get(`${API_BASE_URL}teachers/${teacherId}/`),
            axios.get(`${API_BASE_URL}teacher_unavailable_dates/?teacher_id=${teacherId}`)
        ])
            .then(([teacherRes, datesRes]) => {
                const teacherData = teacherRes.data;
                setTeacherName(`${teacherData.surname} ${teacherData.name} ${teacherData.lastname}`);
                const existing = datesRes.data[0];
                if (existing) {
                    setDates(existing.dates || []);
                    const parsed = existing.dates.map(d => new Date(d));
                    setSelectedDates(parsed);
                } else {
                    setDates([]);
                    setSelectedDates([]);
                }
            })
            .catch(err => {
                console.error(err);
                setError('Не удалось загрузить данные.');
            })
            .finally(() => setLoading(false));
    }, [teacherId]);

    const handleDateChange = (selected) => {
        setSelectedDates(selected);
    };

    const removeDate = (dateStr) => {
        const updated = dates.filter(d => d !== dateStr);
        setDates(updated);
        const updatedSelected = selectedDates.filter(d => d.toISOString().split('T')[0] !== dateStr);
        setSelectedDates(updatedSelected);
    };

    const handleSave = () => {
        const newDates = selectedDates.map(d => d.toISOString().split('T')[0]);

        axios.get(`${API_BASE_URL}teacher_unavailable_dates/?teacher_id=${teacherId}`)
            .then(res => {
                const existing = res.data[0];
                if (existing) {
                    return axios.put(`${API_BASE_URL}teacher_unavailable_dates/${existing.id}/`, {
                        teacher_id: teacherId,
                        dates: newDates
                    });
                } else {
                    return axios.post(`${API_BASE_URL}teacher_unavailable_dates/`, {
                        teacher_id: teacherId,
                        dates: newDates
                    });
                }
            })
            .then(() => {
                alert('Даты сохранены!');
                navigate('/teacher_unavailable_dates');
            })
            .catch(err => {
                console.error(err);
                alert('Ошибка при сохранении дат.');
            });
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <StepsNav currentStep={1}/>
            <h1>Недоступные даты преподавателя</h1>
            <p className="text-muted">{teacherName}</p>

            <p>Выберите даты, в которые преподаватель недоступен. Можно выбрать
                сразу несколько дат с помощью множественного выбора.</p>
            <Flatpickr
                options={{
                    locale: Russian,
                    dateFormat: 'Y-m-d',
                    mode: 'multiple',
                    defaultDate: selectedDates
                }}
                onChange={handleDateChange}
            />

            <h3 className="mt-4">Выбранные даты:</h3>
            {selectedDates.length === 0 && <p>Нет выбранных дат</p>}
            <ul className="list-group">
                {selectedDates.map(d => {
                    const ds = d.toISOString().split('T')[0];
                    return (
                        <li key={ds}
                            className="list-group-item d-flex justify-content-between align-items-center">
                            {ds}
                            <button className="btn btn-sm btn-danger"
                                    onClick={() => removeDate(ds)}>Удалить
                            </button>
                        </li>
                    );
                })}
            </ul>

            <div className="mt-3">
                <button className="btn btn-success"
                        onClick={handleSave}>Сохранить
                </button>
                <button className="btn btn-secondary ms-2"
                        onClick={() => navigate('/teacher_unavailable_dates')}>Отмена
                </button>
            </div>
        </div>
    );
}

export default TeacherUnavailableDatesForm;
