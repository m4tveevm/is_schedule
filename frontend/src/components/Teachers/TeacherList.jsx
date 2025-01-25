import React, {useEffect, useState, useContext} from 'react';
import {Link} from 'react-router-dom';
import {
    getTeachers,
    createTeacher,
    deleteTeacher,
    updateTeacher
} from '../../services/api';
import {AuthContext} from '../../context/AuthContext';
import StepsNav from '../StepsNav';

function TeacherList() {
    const {logout} = useContext(AuthContext);
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('surname');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newTeachers, setNewTeachers] = useState([]);

    useEffect(() => {
        loadTeachers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [teachers, searchTerm, sortBy]);

    const loadTeachers = () => {
        setLoading(true);
        getTeachers()
            .then((response) => {
                setTeachers(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    logout();
                } else {
                    console.error(error);
                    setError('Не удалось загрузить список преподавателей. Попробуйте позже.');
                }
            })
            .finally(() => setLoading(false));
    };

    const applyFilters = () => {
        let updated = [...teachers];
        if (searchTerm.trim() !== '') {
            const lowerTerm = searchTerm.toLowerCase();
            updated = updated.filter(t => t.surname.toLowerCase().includes(lowerTerm));
        }

        if (sortBy === 'surname') {
            updated.sort((a, b) => a.surname.localeCompare(b.surname));
        }
        // else if (sortBy === 'dateAdded') {
        //     updated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        // }

        setFilteredTeachers(updated);
    };

    const handleDelete = (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этого преподавателя?')) {
            deleteTeacher(id)
                .then(() => loadTeachers())
                .catch((error) => {
                    console.error('Ошибка при удалении преподавателя:', error);
                    alert('Не удалось удалить преподавателя. Попробуйте позже.');
                });
        }
    };

    const handleAddNewTeacher = () => {
        setNewTeachers([...newTeachers, {
            surname: '',
            name: '',
            lastname: '',
            shortname: '',
            employerType: 'Совместитель',
            isNew: true
        }]);
    };

    const handleNewTeacherChange = (index, field, value) => {
        const updated = [...newTeachers];
        updated[index][field] = value;
        updated[index].shortname = updated[index].shortname || '';
        setNewTeachers(updated);
    };

    const handleSaveNewTeachers = () => {
        Promise.all(newTeachers.map(nt => createTeacher(nt)))
            .then(() => {
                setNewTeachers([]);
                loadTeachers();
                alert('Новые преподаватели успешно добавлены!');
            })
            .catch((error) => {
                console.error('Ошибка при добавлении новых преподавателей:', error);
                alert('Не удалось добавить некоторых преподавателей. Проверьте данные и попробуйте снова.');
            });
    };

    return (
        <div className="container">
            <StepsNav currentStep={1}/>
            <h1>Управление Сотрудниками</h1>
            <p>Здесь вы можете искать, сортировать, добавлять или удалять
                преподавателей. Также доступен импорт из
                Excel.</p>

            <div
                className="mb-3 d-flex align-items-center justify-content-between">
                <div>
                    <Link to="/teachers/upload"
                          className="btn btn-outline-primary me-2">Импортировать
                        из Excel</Link>
                    <button className="btn btn-primary"
                            onClick={handleAddNewTeacher}>Добавить
                        преподавателя
                    </button>
                </div>
                <div className="d-flex">
                    <input
                        type="text"
                        className="form-control me-2"
                        placeholder="Поиск по фамилии"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{width: '200px'}}
                    />
                    <select className="form-control" value={sortBy}
                            onChange={e => setSortBy(e.target.value)}>
                        <option value="surname">Сортировать по фамилии</option>
                        {/* <option value="dateAdded">Сортировать по дате добавления</option> */}
                    </select>
                </div>
            </div>

            {filteredTeachers.length === 0 && newTeachers.length === 0 && (
                <div className="alert alert-info">
                    Нет преподавателей. Добавьте или импортируйте.
                </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}
            {loading && <p>Загрузка...</p>}
            {newTeachers.length > 0 && (
                <div className="card p-3 mb-3">
                    <h5>Новые преподаватели</h5>
                    {newTeachers.map((nt, index) => (
                        <div key={index} className="mb-2 d-flex gap-2">
                            <input type="text" className="form-control"
                                   placeholder="Фамилия" required
                                   value={nt.surname}
                                   onChange={e => handleNewTeacherChange(index, 'surname', e.target.value)}/>
                            <input type="text" className="form-control"
                                   placeholder="Имя" required
                                   value={nt.name}
                                   onChange={e => handleNewTeacherChange(index, 'name', e.target.value)}/>
                            <input type="text" className="form-control"
                                   placeholder="Отчество" required
                                   value={nt.lastname}
                                   onChange={e => handleNewTeacherChange(index, 'lastname', e.target.value)}/>
                            <select className="form-control"
                                    value={nt.employerType}
                                    onChange={e => handleNewTeacherChange(index, 'employerType', e.target.value)}>
                                <option value="Основной">Основное</option>
                                <option value="Совместитель">Совместитель
                                </option>
                            </select>
                        </div>
                    ))}
                    <button className="btn btn-success"
                            onClick={handleSaveNewTeachers}>Сохранить всех
                    </button>
                </div>
            )}

            <div className="row">
                {filteredTeachers.map((t) => (
                    <div key={t.id} className="col-md-4">
                        <div className="card mb-3 position-relative">
                            <button
                                className="btn btn-sm btn-danger position-absolute"
                                style={{top: '5px', right: '5px'}}
                                onClick={() => handleDelete(t.id)}
                            >
                                ✕
                            </button>
                            <div className="card-body">
                                <h5 className="card-title">{t.surname} {t.name} {t.lastname}</h5>
                                <p className="card-text">
                                    Тип: {t.employerType}<br/>
                                    Краткое ФИО: {t.shortname}
                                </p>
                                <Link to={`/teachers/${t.id}/edit`}
                                      className="btn btn-sm btn-warning me-2">Изменить</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TeacherList;
