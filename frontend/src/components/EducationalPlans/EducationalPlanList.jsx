import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getEducationalPlans,
  deleteEducationalPlan,
  searchEducationalPlans,
} from "../../services/api";
import StepsNav from "../StepsNav";
import SearchSuggestions from "../SearchSuggestions";
import { toast } from "react-toastify";

function EducationalPlanList() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getEducationalPlans();
      setPlans(response.data);
    } catch (err) {
      console.error("Ошибка при загрузке планов:", err);
      setError("Не удалось загрузить учебные планы.");
      toast.error("Не удалось загрузить учебные планы.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот учебный план?"))
      return;
    try {
      await deleteEducationalPlan(id);
      toast.success("Учебный план успешно удалён!");
      loadPlans();
    } catch (err) {
      console.error("Ошибка при удалении плана:", err);
      toast.error("Не удалось удалить учебный план. Попробуйте позже.");
    }
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    try {
      const response = await searchEducationalPlans(query);
      setSuggestions(response.data);
      setActiveIndex(-1);
    } catch (err) {
      console.error("Ошибка при поиске планов:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[activeIndex]);
    }
  };

  const handleSelectSuggestion = (plan) => {
    window.location.href = `/educational_plans/${plan.id}/edit`;
  };

  return (
    <div className="container">
      <StepsNav currentStep={5} />
      <h1>Управление учебными планами</h1>
      <p className="text-muted">
        Здесь вы можете просмотреть, добавить или редактировать учебные планы.
        Используйте поиск для быстрого перехода к нужному плану.
      </p>
      <div className="actions mb-3 d-flex align-items-center">
        <Link to="/educational_plans/add" className="btn btn-primary me-3">
          Добавить учебный план
        </Link>
        <div className="position-relative w-100">
          <input
            type="text"
            className="form-control"
            placeholder="Поиск учебного плана..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          {suggestions.length > 0 && (
            <SearchSuggestions
              suggestions={suggestions}
              activeIndex={activeIndex}
              onSelect={handleSelectSuggestion}
            />
          )}
        </div>
      </div>

      {loading && <p>Загрузка...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && plans.length === 0 && (
        <div className="alert alert-info">
          Учебные планы отсутствуют. Добавьте новый план.
        </div>
      )}
      <div className="row">
        {plans.map((plan) => (
          <div key={plan.id} className="col-md-4">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">{plan.name}</h5>
                <p className="card-text">
                  {plan.description || "Без описания"}
                </p>
                {plan.has_practice && (
                  <p className="text-info">
                    Практика: {plan.practice_start_date} -{" "}
                    {plan.practice_end_date}
                  </p>
                )}
                <div className="d-flex justify-content-between">
                  <Link
                    to={`/educational_plans/${plan.id}/edit`}
                    className="btn btn-sm btn-warning"
                  >
                    Изменить
                  </Link>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(plan.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EducationalPlanList;
