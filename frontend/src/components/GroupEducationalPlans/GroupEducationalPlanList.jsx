import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getGroupEducationalPlans,
  getGroups,
  createGroupEducationalPlan,
  deleteGroupEducationalPlan,
  getEducationalPlans,
} from "../../services/api";
import StepsNav from "../StepsNav";
import { toast } from "react-toastify";

function GroupEducationalPlanList() {
  const [groupPlans, setGroupPlans] = useState([]);
  const [groups, setGroups] = useState([]);
  const [educationalPlans, setEducationalPlans] = useState([]);
  const [newGroupPlans, setNewGroupPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gpRes, gRes, epRes] = await Promise.all([
        getGroupEducationalPlans(),
        getGroups(),
        getEducationalPlans(),
      ]);
      setGroupPlans(gpRes.data);
      setGroups(gRes.data);
      setEducationalPlans(epRes.data);
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить данные. Попробуйте позже.");
      toast.error("Не удалось загрузить данные. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddNew = () => {
    setNewGroupPlans([
      ...newGroupPlans,
      { group: "", educational_plan: "", deadline: "" },
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

  const handleSaveAll = async () => {
    const validNewPlans = newGroupPlans.filter(
      (np) => np.group && np.educational_plan,
    );
    if (validNewPlans.length === 0) {
      toast.info("Заполните обязательные поля для сохранения привязки.");
      return;
    }
    try {
      await Promise.all(
        validNewPlans.map((gp) =>
          createGroupEducationalPlan({
            group: gp.group,
            educational_plan: gp.educational_plan,
            deadline: gp.deadline,
          }),
        ),
      );
      setNewGroupPlans([]);
      await loadData();
      toast.success("Новые привязки успешно добавлены!");
    } catch (error) {
      console.error("Ошибка при добавлении привязок:", error);
      toast.error(
        "Не удалось добавить некоторые привязки. Проверьте данные и попробуйте снова.",
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Вы уверены, что хотите удалить эту привязку?")) {
      try {
        await deleteGroupEducationalPlan(id);
        await loadData();
        toast.success("Привязка успешно удалена!");
      } catch (err) {
        console.error("Ошибка при удалении:", err);
        toast.error("Не удалось удалить привязку. Попробуйте позже.");
      }
    }
  };

  return (
    <div className="container">
      <StepsNav currentStep={6} />
      <h1>Привязка учебных планов к группам</h1>
      <p className="text-muted">
        Здесь вы можете привязать учебные планы к определённым группам. Выберите
        группу и учебный план из выпадающих списков.
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
                    style={{ top: "5px", right: "5px" }}
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
                          handleChangeNew(index, "group", e.target.value)
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

                    <div className="form-group mb-3">
                      <label>Учебный план</label>
                      <select
                        className="form-control"
                        value={ngp.educational_plan}
                        onChange={(e) =>
                          handleChangeNew(
                            index,
                            "educational_plan",
                            e.target.value,
                          )
                        }
                        required
                      >
                        <option value="">-- Выберите план --</option>
                        {educationalPlans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group mb-3">
                      <label>Дедлайн (необязательно)</label>
                      <input
                        type="date"
                        className="form-control"
                        value={ngp.deadline}
                        onChange={(e) =>
                          handleChangeNew(index, "deadline", e.target.value)
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
                  style={{ top: "5px", right: "5px" }}
                  onClick={() => handleDelete(gp.id)}
                >
                  ✕
                </button>
                <div className="card-body">
                  <h5 className="card-title">Группа: {gp.group_name}</h5>
                  <p className="card-text">План: {gp.educational_plan_name}</p>
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
