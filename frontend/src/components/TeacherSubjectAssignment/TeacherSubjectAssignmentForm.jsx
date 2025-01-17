import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    createTeacherProfile,
    getTeachers,
    getSubjects
} from '../../services/api';

function TeacherSubjectAssignmentForm() {
    const [teacherId, setTeacherId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        getTeachers()
            .then((response) => {
                setTeachers(response.data);
            })
            .catch((error) => {
                console.error('Ошибка при загрузке преподавателей:', error);
            });

        getSubjects()
            .then((response) => {
                setSubjects(response.data);
            })
            .catch((error) => {
                console.error('Ошибка при загрузке дисциплин:', error);
            });
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = {
            teacher: teacherId,
            subject: subjectId,
        };
        createTeacherProfile(data)
            .then(() => {
                navigate('/teacher_subject_assignments');
            })
            .catch((error) => {
                console.error('Ошибка при создании назначения:', error);
            });
    };

    return (
        <div>
            <h1>Добавить назначение дисциплины преподавателю</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Преподаватель</label>
                    <select
                        className="form-control"
                        value={teacherId}
                        onChange={(e) => setTeacherId(e.target.value)}
                        required
                    >
                        <option value="">-- Выберите преподавателя --</option>
                        {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                                {teacher.shortname}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Дисциплина</label>
                    <select
                        className="form-control"
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        required
                    >
                        <option value="">-- Выберите дисциплину --</option>
                        {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                                {subject.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="btn btn-success mt-2">
                    Сохранить
                </button>
                <button
                    type="button"
                    className="btn btn-secondary mt-2 ms-2"
                    onClick={() => navigate('/teacher_subject_assignments')}
                >
                    Отмена
                </button>
            </form>
        </div>
    );
}

export default TeacherSubjectAssignmentForm;