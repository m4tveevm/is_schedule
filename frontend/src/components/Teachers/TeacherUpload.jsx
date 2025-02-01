import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadTeachers } from '../../services/api';
import { toast } from 'react-toastify';

function TeacherUpload() {
    const [file, setFile] = useState(null);
    const [employerType, setEmployerType] = useState('Совместитель');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploaded, setUploaded] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!file) {
            setError('Пожалуйста, выберите файл для загрузки.');
            toast.error('Пожалуйста, выберите файл для загрузки.');
            return;
        }
        setLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('employerType', employerType);

        uploadTeachers(formData)
            .then(() => {
                setLoading(false);
                setUploaded(true);
                toast.success('Импорт преподавателей завершён!');
            })
            .catch((error) => {
                setLoading(false);
                setError('Ошибка при загрузке файла. Пожалуйста, попробуйте снова.');
                console.error('Ошибка при загрузке преподавателей:', error);
                toast.error('Ошибка при загрузке файла. Пожалуйста, попробуйте снова.');
            });
    };

    const handleConfirm = () => {
        navigate('/teachers');
    };

    return (
        <div className="container mt-4">
            <h1>Импорт преподавателей</h1>
            <p className="text-muted">
                Загрузите Excel-файл со списком преподавателей в формате:
                <br />"ФИО", "Название предмета" и т.д.
                <br />
                Пример структуры:
                <code> ФИО | Название предмета</code>
                <br />
                Иванов Иван Иванович | Математика
            </p>
            {error && <div className="alert alert-danger">{error}</div>}
            {!uploaded ? (
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="form-group mb-3">
                        <label><b>Выберите файл Excel</b></label>
                        <input
                            type="file"
                            className="form-control"
                            accept=".xlsx, .xls"
                            onChange={(e) => setFile(e.target.files[0])}
                            required
                        />
                        {file && <small className="text-muted">Выбран файл: {file.name}</small>}
                    </div>
                    <div className="form-group mb-3">
                        <label><b>Тип сотрудников для импорта</b></label>
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
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Загрузка...' : 'Загрузить'}
                    </button>
                    <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/teachers')}>
                        Отмена
                    </button>
                </form>
            ) : (
                <div className="mt-3">
                    <p className="alert alert-success">
                        Импорт завершён! Преподаватели успешно импортированы.
                    </p>
                    <button className="btn btn-success" onClick={handleConfirm}>
                        Ок
                    </button>
                </div>
            )}
        </div>
    );
}

export default TeacherUpload;
