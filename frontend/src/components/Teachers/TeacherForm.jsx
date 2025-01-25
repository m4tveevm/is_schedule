import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    getTeacherById,
    createTeacher,
    updateTeacher
} from '../../services/api';

function TeacherForm() {
    const [surname, setSurname] = useState('');
    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [shortname, setShortname] = useState('');
    const [employerType, setEmployerType] = useState('Совместитель');
    const navigate = useNavigate();
    const {id} = useParams();

    useEffect(() => {
        if (id) {
            getTeacherById(id)
                .then((response) => {
                    const data = response.data;
                    setSurname(data.surname || '');
                    setName(data.name || '');
                    setLastname(data.lastname || '');
                    setShortname(data.shortname || '');
                    setEmployerType(data.employerType || 'Совместитель');
                })
                .catch((error) => {
                    console.error('Ошибка при загрузке преподавателя:', error);
                });
        }
    }, [id]);

    const handleSubmit = (event) => {
        event.preventDefault();
        const teacherData = {
            surname,
            name,
            lastname,
            shortname,
            employerType,
        };
        if (id) {
            updateTeacher(id, teacherData)
                .then(() => {
                    navigate('/teachers');
                })
                .catch((error) => {
                    console.error('Ошибка при обновлении преподавателя:', error);
                });
        } else {
            createTeacher(teacherData)
                .then(() => {
                    navigate('/teachers');
                })
                .catch((error) => {
                    console.error('Ошибка при создании преподавателя:', error);
                });
        }
    };

    return (
        <div>
            <h1>{id ? 'Редактировать преподавателя' : 'Добавить преподавателя'}</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Фамилия</label>
                    <input
                        type="text"
                        className="form-control"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Имя</label>
                    <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Отчество</label>
                    <input
                        type="text"
                        className="form-control"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Сокращенное имя</label>
                    <input
                        type="text"
                        className="form-control"
                        value={shortname}
                        onChange={(e) => setShortname(e.target.value)}
                        placeholder="Оставьте пустым для автогенерации"
                    />
                </div>
                <div className="form-group">
                    <label>Тип сотрудника</label>
                    <select
                        className="form-control"
                        value={employerType}
                        onChange={(e) => setEmployerType(e.target.value)}
                        required
                    >
                        <option value="Основной">Основное место работы</option>
                        <option value="Совместитель">Совместитель</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-success mt-2">
                    Сохранить
                </button>
                <button
                    type="button"
                    className="btn btn-secondary mt-2 ms-2"
                    onClick={() => navigate('/teachers')}
                >
                    Отмена
                </button>
            </form>
        </div>
    );
}

export default TeacherForm;