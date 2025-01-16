import React, {useEffect, useState, useContext} from 'react';
import {Link} from 'react-router-dom';
import {getGroups, deleteGroup, createGroup} from '../../services/api';
import {AuthContext} from '../../context/AuthContext';
import StepsNav from '../StepsNav';

function GroupList() {
    const [groups, setGroups] = useState([]);
    const [newGroups, setNewGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {logout} = useContext(AuthContext);


    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = () => {
        setLoading(true);
        setError(null);
        getGroups()
            .then((response) => {
                setGroups(response.data);
            })
            .catch((error) => {
                console.error('Ошибка при загрузке групп:', error);
                if (error.response && error.response.status === 401) {
                    logout();
                } else {
                    setError('Не удалось загрузить группы. Попробуйте позже.');
                }
            })
            .finally(() => setLoading(false));
    };

    const handleAddNewGroup = () => {
        setNewGroups([...newGroups, {name: ''}]);
    };

    const handleNewGroupChange = (index, value) => {
        const updated = [...newGroups];
        updated[index].name = value;
        setNewGroups(updated);
    };

    const handleRemoveNewGroup = (index) => {
        setNewGroups(newGroups.filter((_, i) => i !== index));
    };

    const handleSaveAllNewGroups = () => {
        Promise.all(newGroups.map(g => createGroup(g)))
            .then(() => {
                setNewGroups([]);
                loadGroups();
                alert('Новые группы успешно добавлены!');
            })
            .catch((error) => {
                console.error('Ошибка при добавлении групп:', error);
                alert('Не удалось добавить некоторые группы. Проверьте данные и попробуйте снова.');
            });
    };

    const handleDeleteGroup = (id) => {
        if (window.confirm('Вы уверены, что хотите удалить эту группу?')) {
            deleteGroup(id)
                .then(() => loadGroups())
                .catch((error) => {
                    console.error('Ошибка при удалении группы:', error);
                    alert('Не удалось удалить группу. Попробуйте позже.');
                });
        }
    };

    return (
        <div className="container">
            <StepsNav currentStep={2}/>
            <h1>Управление Группами</h1>
            <p>Здесь вы можете просматривать, добавлять и редактировать
                группы.</p>
            <div className="actions mb-3 d-flex justify-content-between">
                <button className="btn btn-primary"
                        onClick={handleAddNewGroup}>Добавить группу
                </button>
                {newGroups.length > 0 && (
                    <button className="btn btn-success"
                            onClick={handleSaveAllNewGroups}>Сохранить
                        всех</button>
                )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {loading && <p>Загрузка...</p>}

            {newGroups.length > 0 && (
                <div className="row mb-4">
                    {newGroups.map((ng, index) => (
                        <div key={`new-${index}`} className="col-md-4">
                            <div className="card mb-3 position-relative">
                                <button
                                    className="btn btn-sm btn-danger position-absolute"
                                    style={{top: '5px', right: '5px'}}
                                    onClick={() => handleRemoveNewGroup(index)}
                                >
                                    ✕
                                </button>
                                <div className="card-body">
                                    <h5 className="card-title">Новая
                                        группа</h5>
                                    <div className="mb-2">
                                        <label className="form-label">Номер
                                            группы</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Например: 101"
                                            value={ng.name}
                                            onChange={e => handleNewGroupChange(index, e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {groups.length === 0 && !loading && !error && newGroups.length === 0 && (
                <div className="alert alert-info">
                    Пока нет ни одной сохранённой группы. Добавьте новую или
                    импортируйте.
                </div>
            )}

            {groups.length > 0 && (
                <div className="row">
                    {groups.map((g) => (
                        <div key={g.id} className="col-md-4">
                            <div className="card mb-3 position-relative">
                                <button
                                    className="btn btn-sm btn-danger position-absolute"
                                    style={{top: '5px', right: '5px'}}
                                    onClick={() => handleDeleteGroup(g.id)}
                                >
                                    ✕
                                </button>
                                <div className="card-body">
                                    <h5 className="card-title">Группа
                                        ID: {g.id}</h5>
                                    <p className="card-text">Номер
                                        группы: {g.name}</p>
                                    <Link to={`/groups/${g.id}/edit`}
                                          className="btn btn-sm btn-warning me-2">Изменить</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default GroupList;
