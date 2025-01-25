import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    API_BASE_URL, getGroupEducationalPlanById, createGroupEducationalPlan, updateGroupEducationalPlan, getGroups
} from '../../services/api';
import StepsNav from '../StepsNav';
import axios from 'axios';

function GroupEducationalPlanForm() {
    const [group, setGroup] = useState('');
    const [educationalPlan, setEducationalPlan] = useState('');
    const [planQuery, setPlanQuery] = useState('');
    const [deadline, setDeadline] = useState('');
    const [groups, setGroups] = useState([]);
    const [planSuggestions, setPlanSuggestions] = useState([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const {id} = useParams();

    useEffect(() => {
        getGroups()
            .then((gRes) => {
                setGroups(gRes.data);
                if (id) {
                    return getGroupEducationalPlanById(id);
                }
            })
            .then((gpResponse) => {
                if (gpResponse) {
                    const data = gpResponse.data;
                    setGroup(data.group || '');
                    setEducationalPlan(data.educational_plan || '');
                    setDeadline(data.deadline || '');
                    if (data.educational_plan) {
                        return axios.get(`${API_BASE_URL}educational_plans/${data.educational_plan}/`);
                    }
                }
            })
            .then((planRes) => {
                if (planRes) {
                    setPlanQuery(planRes.data.name);
                }
            })
            .catch((error) => {
                console.error('Ошибка при загрузке данных:', error);
                setError('Не удалось загрузить данные. Попробуйте позже.');
            })
            .finally(() => setLoading(false));
    }, [id]);

    const searchPlans = (query) => {
        if (!query) {
            setPlanSuggestions([]);
            return;
        }
        axios
            .get(`${API_BASE_URL}educational_plans/?search=${encodeURIComponent(query)}`)
            .then((res) => setPlanSuggestions(res.data))
            .catch((err) => console.error('Ошибка при поиске планов:', err));
    };

    const handlePlanQueryChange = (e) => {
        const query = e.target.value;
        setPlanQuery(query);
        setEducationalPlan(''); // сбрасываем выбранный план
        searchPlans(query);
    };

    const handleSelectSuggestion = (plan) => {
        setEducationalPlan(plan.id);
        setPlanQuery(plan.name);
        setPlanSuggestions([]);
        setActiveSuggestionIndex(-1);
    };

    const handlePlanKeyDown = (e) => {
        if (planSuggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestionIndex((prev) => Math.min(prev + 1, planSuggestions.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestionIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (activeSuggestionIndex >= 0 && planSuggestions[activeSuggestionIndex]) {
                    handleSelectSuggestion(planSuggestions[activeSuggestionIndex]);
                }
            }
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const gpData = {group, educational_plan: educationalPlan, deadline};
        const request = id ? updateGroupEducationalPlan(id, gpData) : createGroupEducationalPlan(gpData);

        request
            .then(() => navigate('/group_educational_plans'))
            .catch((err) => {
                console.error('Ошибка при сохранении привязки:', err);
                alert('Не удалось сохранить. Проверьте данные и попробуйте снова.');
            });
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (<div className="container mt-4">
        <StepsNav currentStep={6}/>
        <h1>{id ? 'Редактировать привязку' : 'Добавить привязку'}</h1>
        <p className="text-muted">
            {id ? 'Измените данные привязки (группа, план, дедлайн) и сохраните.' : 'Выберите группу, учебный план (с помощью поиска) и при необходимости укажите дедлайн.'}
        </p>
        <div className="card" style={{maxWidth: '600px', margin: '0 auto'}}>
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <label className="form-label" htmlFor="group">
                            Группа
                        </label>
                        <select
                            className="form-control"
                            id="group"
                            value={group}
                            onChange={(e) => setGroup(e.target.value)}
                            required
                        >
                            <option value="">-- Выберите группу --</option>
                            {groups.map((g) => (<option key={g.id} value={g.id}>
                                {g.name}
                            </option>))}
                        </select>
                    </div>

                    <div className="form-group mb-3 position-relative">
                        <label className="form-label">Учебный план (поиск)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={planQuery}
                            onChange={handlePlanQueryChange}
                            onKeyDown={handlePlanKeyDown}
                            placeholder="Начните вводить..."
                            required
                        />
                        {planSuggestions.length > 0 && planQuery && (<ul
                            className="list-group position-absolute w-100"
                            style={{zIndex: 999, top: '100%'}}
                        >
                            {planSuggestions.map((plan, i) => (<li
                                key={plan.id}
                                className={`list-group-item ${i === activeSuggestionIndex ? 'active' : ''}`}
                                onMouseDown={() => handleSelectSuggestion(plan)}
                                style={{cursor: 'pointer'}}
                            >
                                {plan.name}
                            </li>))}
                        </ul>)}
                    </div>

                    <div className="form-group mb-3">
                        <label className="form-label" htmlFor="deadline">
                            Дедлайн
                        </label>
                        <input
                            type="date"
                            id="deadline"
                            className="form-control"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                        />
                    </div>

                    <div className="d-flex justify-content-end mt-4">
                        <button type="submit" className="btn btn-success">
                            Сохранить
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => navigate('/group_educational_plans')}
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>);
}

export default GroupEducationalPlanForm;
