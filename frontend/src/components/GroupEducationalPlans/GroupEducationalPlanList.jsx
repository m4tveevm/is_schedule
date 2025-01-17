import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {
  getGroupEducationalPlans,
  getGroups,
  createGroupEducationalPlan,
  deleteGroupEducationalPlan,
  API_BASE_URL
} from '../../services/api';
import StepsNav from '../StepsNav';
import axios from 'axios';

function GroupEducationalPlanList() {
  const [groupPlans, setGroupPlans] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newGroupPlans, setNewGroupPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [planSuggestions, setPlanSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const loadData = () => {
    Promise.all([getGroupEducationalPlans(), getGroups()])
      .then(([gpRes, gRes]) => {
        setGroupPlans(gpRes.data);
        setGroups(gRes.data);
      })
      .catch((err) => {
        console.error(err);
        setError('Не удалось загрузить данные. Попробуйте позже.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddNew = () => {
    setNewGroupPlans([
      ...newGroupPlans,
      { group: '', educational_plan: '', deadline: '', planQuery: '' }
    ]);
  };

  const handleRemoveNew = (index) => {
    setNewGroupPlans(newGroupPlans.filter((_, i) => i !== index));
  };

  const handleChangeNew = (index, field, value) => {
    const updated = [...newGroupPlans];
    updated[index][field] = value;
    setNewGroupPlans(updated);
  };

  const handleSaveAll = () => {
    Promise.all(
      newGroupPlans.map((gp) =>
        createGroupEducationalPlan({
          group: gp.group,
          educational_plan: gp.educational_plan,
          deadline: gp.deadline,
        })
      )
    )
      .then(() => {
        setNewGroupPlans([]);
        loadData();
        alert('Новые привязки успешно добавлены!');
      })
      .catch((error) => {
        console.error('Ошибка при добавлении привязок:', error);
        alert(
          'Не удалось добавить некоторые привязки. Проверьте данные и попробуйте снова.'
        );
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту привязку?')) {
      deleteGroupEducationalPlan(id)
        .then(() => loadData())
        .catch((err) => {
          console.error('Ошибка при удалении:', err);
          alert('Не удалось удалить. Попробуйте позже.');
        });
    }
  };

  const searchPlans = (query) => {
    if (!query) {
      setPlanSuggestions([]);
      return;
    }
    axios
      .get(`${API_BASE_URL}educational_plans/?search=${encodeURIComponent(query)}`)
      .then((res) => {
        setPlanSuggestions(res.data);
      })
      .catch((err) => console.error('Ошибка при поиске планов:', err));
  };

  const handlePlanQueryChange = (index, e) => {
    const query = e.target.value;
    handleChangeNew(index, 'planQuery', query);
    handleChangeNew(index, 'educational_plan', '');
    searchPlans(query);
  };

  const handleSelectSuggestion = (index, plan) => {
    const updated = [...newGroupPlans];
    updated[index].educational_plan = plan.id;
    updated[index].planQuery = plan.name;
    setNewGroupPlans(updated);
    setPlanSuggestions([]);
    setActiveSuggestionIndex(-1);
  };

  const handlePlanKeyDown = (e) => {
    if (planSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          Math.min(prev + 1, planSuggestions.length - 1)
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeSuggestionIndex >= 0 && planSuggestions[activeSuggestionIndex]) {
          // TODO: нужно знать, в какое именно поле хотим записать
        }
      }
    }
  };

  return (
    <div className="container">
      <StepsNav currentStep={6}/>
      <h1>Привязка учебных планов к группам</h1>
      <p className="text-muted">
        Здесь вы можете привязать учебные планы к определённым группам.
        Чтобы упростить поиск плана, начните вводить название, и
        появятся подсказки.
      </p>
      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-primary" onClick={handleAddNew}>
          Добавить привязку
        </button>
        {newGroupPlans.length > 0 && (
          <button className="btn btn-success" onClick={handleSaveAll}>
            Сохранить все
          </button>
        )}
      </div>

      {loading && <p>Загрузка...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {newGroupPlans.length > 0 && (
        <div className="mb-4">
          <h3>Новые привязки</h3>
          <div className="row">
            {newGroupPlans.map((ngp, index) => (
              <div key={index} className="col-md-4">
                <div className="card mb-3 position-relative">
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute"
                    style={{ top: '5px', right: '5px' }}
                    onClick={() => handleRemoveNew(index)}
                  >
                    ✕
                  </button>
                  <div className="card-body">

                    <div className="form-group mb-3">
                      <label>Группа</label>
                      <select
                        className="form-control"
                        value={ngp.group}
                        onChange={(e) =>
                          handleChangeNew(index, 'group', e.target.value)
                        }
                        required
                      >
                        <option value="">-- Выберите группу --</option>
                        {groups.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>


                    <div className="form-group mb-3 position-relative">
                      <label>Учебный план (поиск)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={ngp.planQuery || ''}
                        onChange={(e) => handlePlanQueryChange(index, e)}
                        onKeyDown={handlePlanKeyDown}
                        placeholder="Начните вводить..."
                        required
                      />
                      {planSuggestions.length > 0 && ngp.planQuery && (
                        <ul
                          className="list-group position-absolute w-100"
                          style={{ zIndex: 999, top: '100%' }}
                        >
                          {planSuggestions.map((plan, i) => (
                            <li
                              key={plan.id}
                              className={`list-group-item ${
                                i === activeSuggestionIndex ? 'active' : ''
                              }`}
                              onMouseDown={() => handleSelectSuggestion(index, plan)}
                              style={{ cursor: 'pointer' }}
                            >
                              {plan.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="form-group mb-3">
                      <label>Дедлайн (необязательно)</label>
                      <input
                        type="date"
                        className="form-control"
                        value={ngp.deadline}
                        onChange={(e) =>
                          handleChangeNew(index, 'deadline', e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {groupPlans.length === 0 && newGroupPlans.length === 0 && (
        <div className="alert alert-info">
          Пока нет ни одной привязки. Добавьте новую.
        </div>
      )}

      {groupPlans.length > 0 && (
        <div className="row">
          {groupPlans.map((gp) => (
            <div key={gp.id} className="col-md-4">
              <div className="card mb-3 position-relative">
                <button
                  className="btn btn-sm btn-danger position-absolute"
                  style={{ top: '5px', right: '5px' }}
                  onClick={() => handleDelete(gp.id)}
                >
                  ✕
                </button>
                <div className="card-body">
                  <h5 className="card-title">
                    Группа: {gp.group_name}
                  </h5>
                  <p className="card-text">
                    План: {gp.educational_plan_name}
                  </p>
                  {gp.deadline && (
                    <p className="text-info">Дедлайн: {gp.deadline}</p>
                  )}
                  <Link
                    to={`/group_educational_plans/${gp.id}/edit`}
                    className="btn btn-sm btn-warning"
                  >
                    Изменить
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GroupEducationalPlanList;
