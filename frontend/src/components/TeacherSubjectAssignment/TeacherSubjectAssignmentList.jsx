import React, {useContext, useEffect, useState} from 'react';
import {getTeacherProfiles, deleteTeacherProfile} from '../../services/api';
import {AuthContext} from "../../context/AuthContext";
import {useNavigate} from "react-router-dom";
import StepsNav from '../StepsNav';

function TeacherSubjectAssignmentList() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {logout} = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        loadAssignments();
    }, []);

    const handleUnauthorized = () => {
        logout();
        navigate('/login');
    };

    const loadAssignments = () => {
        setLoading(true);
        getTeacherProfiles()
            .then((response) => {
                setAssignments(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    handleUnauthorized();
                } else {
                    console.error(error);
                    setError('Не удалось загрузить список дисциплин. Попробуйте позже.');
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleDelete = (id) => {
        if (window.confirm('Вы уверены, что хотите удалить это назначение?')) {
            deleteTeacherProfile(id)
                .then(() => {
                    loadAssignments();
                })
                .catch((error) => {
                    console.error('Ошибка при удалении назначения:', error);
                });
        }
    };


    return (<div className="container">
        <StepsNav currentStep={4}/>
        <h1>Назначения дисциплин преподавателям</h1>
        <div className="mb-3">
            <a href="/teacher_subject_assignments/add"
               className="btn btn-primary">
                Добавить назначение
            </a>
        </div>
        {loading && <p>Загрузка...</p>}
        {error && <div className="alert alert-danger">{error}</div>}
        {assignments.length === 0 ? (<div className="alert alert-info">
            <p>Нет назначений. Вы можете добавить новое назначение.</p>
        </div>) : (<table className="table">
            <thead>
            <tr>
                <th>ID</th>
                <th>Преподаватель</th>
                <th>Дисциплина</th>
                <th>Действия</th>
            </tr>
            </thead>
            <tbody>
            {assignments.map((assignment) => (<tr key={assignment.id}>
                <td>{assignment.id}</td>
                <td>{assignment.teacher_name}</td>
                <td>{assignment.subject_name}</td>
                <td>
                    <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(assignment.id)}
                    >
                        Удалить
                    </button>
                </td>
            </tr>))}
            </tbody>
        </table>)}
    </div>);
}

export default TeacherSubjectAssignmentList;