import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    getEducationalPlanById,
    createEducationalPlan,
    updateEducationalPlan,
    getSubjects
} from '../../services/api';
import StepsNav from '../StepsNav';
import EducationalPlanEntries from './EducationalPlanEntries';

function EducationalPlanForm() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [hasPractice, setHasPractice] = useState(false);
    const [practiceStartDate, setPracticeStartDate] = useState('');
    const [practiceEndDate, setPracticeEndDate] = useState('');

    const [entries, setEntries] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const navigate = useNavigate();
    const {id} = useParams();

    useEffect(() => {
        getSubjects()
            .then(res => setSubjects(res.data))
            .catch(console.error);

        if (id) {
            getEducationalPlanById(id)
                .then(res => {
                    const data = res.data;
                    setName(data.name || '');
                    setDescription(data.description || '');
                    setHasPractice(data.has_practice || false);
                    setPracticeStartDate(data.practice_start_date || '');
                    setPracticeEndDate(data.practice_end_date || '');
                    setEntries(data.entries || []);
                })
                .catch(err => console.error('Ошибка при загрузке плана:', err));
        }
    }, [id]);

    const handleAddEntry = () => {
        setEntries(prev => [...prev, {
            subject: '',
            'УП': 0,
            'КЛ': 0,
            'ДК': 0
        }]);
    };

    const handleEntryChange = (index, field, value) => {
        const updated = [...entries];
        updated[index][field] = value;
        setEntries(updated);
    };

    const handleRemoveEntry = (index) => {
        const updated = [...entries];
        updated.splice(index, 1);
        setEntries(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (hasPractice && (!practiceStartDate || !practiceEndDate)) {
            alert('Укажите даты начала и окончания практики.');
            return;
        }

        const planData = {
            name,
            description,
            has_practice: hasPractice,
            practice_start_date: hasPractice ? practiceStartDate : null,
            practice_end_date: hasPractice ? practiceEndDate : null,
            entries,
        };

        const request = id ? updateEducationalPlan(id, planData) : createEducationalPlan(planData);

        request
            .then(() => navigate('/educational_plans'))
            .catch(err => {
                console.error('Ошибка при сохранении плана:', err);
                alert('Не удалось сохранить план. Проверьте правильность данных.');
            });
    };

    return (
        <div className="container mt-4">
            <StepsNav currentStep={5}/>
            <h1>{id ? 'Редактировать учебный план' : 'Добавить учебный план'}</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Название плана</label>
                    <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Описание</label>
                    <textarea
                        className="form-control"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>
                <div className="form-check mb-3">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="hasPractice"
                        checked={hasPractice}
                        onChange={e => setHasPractice(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="hasPractice">Есть
                        практика</label>
                </div>
                {hasPractice && (
                    <div className="row mb-3">
                        <div className="col">
                            <label className="form-label">Дата начала
                                практики</label>
                            <input
                                type="date"
                                className="form-control"
                                value={practiceStartDate}
                                onChange={e => setPracticeStartDate(e.target.value)}
                            />
                        </div>
                        <div className="col">
                            <label className="form-label">Дата окончания
                                практики</label>
                            <input
                                type="date"
                                className="form-control"
                                value={practiceEndDate}
                                onChange={e => setPracticeEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                )}
                <EducationalPlanEntries
                    entries={entries}
                    subjects={subjects}
                    onAdd={handleAddEntry}
                    onChange={handleEntryChange}
                    onRemove={handleRemoveEntry}
                />
                <div className="d-flex justify-content-end">
                    <button type="submit"
                            className="btn btn-success me-2">Сохранить
                    </button>
                    <button type="button" className="btn btn-secondary"
                            onClick={() => navigate('/educational_plans')}>
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EducationalPlanForm;