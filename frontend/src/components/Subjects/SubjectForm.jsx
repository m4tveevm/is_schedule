import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getSubjectById,
  createSubject,
  updateSubject,
} from "../../services/api";
import StepsNav from "../StepsNav";
import { toast } from "react-toastify";

function SubjectForm() {
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getSubjectById(id)
        .then((response) => {
          setName(response.data.name);
          setShortName(response.data.short_name);
        })
        .catch((error) => {
          console.error("Ошибка при загрузке предмета:", error);
          toast.error("Ошибка при загрузке данных предмета.");
        });
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (name.trim() === "") {
      toast.info("Название предмета обязательно для заполнения.");
      return;
    }

    const data = {
      name: name.trim(),
      short_name: shortName.trim(),
    };

    const request = id ? updateSubject(id, data) : createSubject(data);
    request
      .then(() => {
        toast.success(`Предмет успешно ${id ? "обновлен" : "создан"}!`);
        navigate("/subjects");
      })
      .catch((error) => {
        console.error("Ошибка при сохранении предмета:", error);
        toast.error(
          "Ошибка при сохранении предмета. Проверьте данные и попробуйте снова.",
        );
      });
  };

  return (
    <div className="container mt-4">
      <StepsNav currentStep={3} />
      <h1>{id ? "Редактировать предмет" : "Добавить предмет"}</h1>
      <p className="text-muted">
        {id
          ? "Измените данные предмета и сохраните."
          : "Введите название и краткое название нового предмета."}
      </p>
      <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="name">
                Название
              </label>
              <input
                type="text"
                id="name"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="shortName">
                Краткое название
              </label>
              <input
                type="text"
                id="shortName"
                className="form-control"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
              />
            </div>
            <div className="d-flex justify-content-end mt-4">
              <button type="submit" className="btn btn-success">
                Сохранить
              </button>
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={() => navigate("/subjects")}
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

export default SubjectForm;
