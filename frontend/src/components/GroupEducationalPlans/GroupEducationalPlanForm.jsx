import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getGroupEducationalPlanById,
  createGroupEducationalPlan,
  updateGroupEducationalPlan,
  getGroups,
  getEducationalPlans,
} from "../../services/api";
import StepsNav from "../StepsNav";
import { toast } from "react-toastify";

function GroupEducationalPlanForm() {
  const [group, setGroup] = useState("");
  const [educationalPlan, setEducationalPlan] = useState("");
  const [deadline, setDeadline] = useState("");
  const [groups, setGroups] = useState([]);
  const [educationalPlans, setEducationalPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    async function loadData() {
      try {
        const [groupsRes, plansRes] = await Promise.all([
          getGroups(),
          getEducationalPlans(),
        ]);
        setGroups(groupsRes.data);
        setEducationalPlans(plansRes.data);
        if (id) {
          const gpRes = await getGroupEducationalPlanById(id);
          const data = gpRes.data;
          setGroup(data.group || "");
          setEducationalPlan(data.educational_plan || "");
          setDeadline(data.deadline || "");
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
        setError("Не удалось загрузить данные. Попробуйте позже.");
        toast.error("Не удалось загрузить данные. Попробуйте позже.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleClearDeadline = () => {
    setDeadline("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!group || !educationalPlan) {
      toast.info("Пожалуйста, выберите группу и учебный план.");
      return;
    }
    const gpData = { group, educational_plan: educationalPlan, deadline };
    try {
      if (id) {
        await updateGroupEducationalPlan(id, gpData);
      } else {
        await createGroupEducationalPlan(gpData);
      }
      toast.success("Данные успешно сохранены!");
      navigate("/group_educational_plans");
    } catch (err) {
      console.error("Ошибка при сохранении привязки:", err);
      toast.error("Не удалось сохранить. Проверьте данные и попробуйте снова.");
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <StepsNav currentStep={6} />
      <h1>{id ? "Редактировать привязку" : "Добавить привязку"}</h1>
      <p className="text-muted">
        {id
          ? "Измените данные привязки (группа, план, дедлайн) и сохраните."
          : "Выберите группу, учебный план и, при необходимости, укажите дедлайн."}
      </p>
      <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
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
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group mb-3">
              <label className="form-label" htmlFor="educationalPlan">
                Учебный план
              </label>
              <select
                className="form-control"
                id="educationalPlan"
                value={educationalPlan}
                onChange={(e) => setEducationalPlan(e.target.value)}
                required
              >
                <option value="">-- Выберите учебный план --</option>
                {educationalPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group mb-3 d-flex align-items-center">
              <div style={{ flexGrow: 1 }}>
                <label className="form-label" htmlFor="deadline">
                  Дедлайн (необязательно)
                </label>
                <input
                  type="date"
                  id="deadline"
                  className="form-control"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              {deadline && (
                <button
                  type="button"
                  className="btn btn-outline-secondary ms-2 mt-4"
                  onClick={handleClearDeadline}
                >
                  Очистить
                </button>
              )}
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button type="submit" className="btn btn-success">
                Сохранить
              </button>
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={() => navigate("/group_educational_plans")}
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GroupEducationalPlanForm;
