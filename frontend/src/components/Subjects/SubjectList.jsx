import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {getSubjects, deleteSubject} from '../../services/api';
import StepsNav from '../StepsNav';

function SubjectList() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = () => {
        setLoading(true);
        setError(null);
        getSubjects()
            .then((response) => setSubjects(response.data))
            .catch((error) => {
                console.error(error);
                setError('Не удалось загрузить список предметов.');
            })
            .finally(() => setLoading(false));
    };

    const handleDelete = (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот предмет?')) {
            deleteSubject(id)
                .then(() => loadSubjects())
                .catch(err => console.error('Ошибка при удалении предмета:', err));
        }
    };

    return (
        <div className="container">
            <StepsNav currentStep={3}/>
            <h1>Предметы</h1>
            <p className="text-muted">
                На этом этапе вы можете управлять списком предметов
                (дисциплин), которые будут использоваться при формировании
                учебных планов.
            </p>
            <div className="actions mb-3">
                <Link to="/subjects/add" className="btn btn-primary">Добавить
                    предмет</Link>
            </div>
            {loading && <p>Загрузка...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {subjects.length > 0 && (
                <table className="table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Краткое название</th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {subjects.map((subject) => (
                        <tr key={subject.id}>
                            <td>{subject.id}</td>
                            <td>{subject.name}</td>
                            <td>{subject.short_name}</td>
                            <td>
                                <Link to={`/subjects/${subject.id}/edit`}
                                      className="btn btn-sm btn-warning me-2">
                                    Изменить
                                </Link>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(subject.id)}
                                >
                                    Удалить
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default SubjectList;