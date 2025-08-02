import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { getGroups, deleteGroup, createGroup } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import StepsNav from "../StepsNav";
import { toast } from "react-toastify";

function GroupList() {
  const [groups, setGroups] = useState([]);
  const [newGroups, setNewGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = () => {
    setLoading(true);
    setError(null);
    getGroups()
      .then((response) => {
        const sortedGroups = [...response.data].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        setGroups(sortedGroups);
      })
      .catch((error) => {
        console.error("Ошибка при загрузке групп:", error);
        if (error.response && error.response.status === 401) {
          logout();
        } else {
          setError("Не удалось загрузить группы. Попробуйте позже.");
          toast.error("Не удалось загрузить группы. Попробуйте позже.");
        }
      })
      .finally(() => setLoading(false));
  };

  const handleAddNewGroup = () => {
    setNewGroups([...newGroups, { name: "", isNew: true }]);
  };

  const handleNewGroupChange = (index, value) => {
    const updated = [...newGroups];
    updated[index].name = value;
    setNewGroups(updated);
  };

  const handleRemoveNewGroup = (index) => {
    const updated = [...newGroups];
    updated.splice(index, 1);
    setNewGroups(updated);
  };

  const handleSaveAllNewGroups = () => {
    const nonEmptyGroups = newGroups.filter((g) => g.name.trim() !== "");
    if (nonEmptyGroups.length === 0) {
      toast.info("Нет заполненных карточек для сохранения.");
      return;
    }
    Promise.all(nonEmptyGroups.map((g) => createGroup(g)))
      .then(() => {
        setNewGroups([]);
        loadGroups();
        toast.success("Новые группы успешно добавлены!");
      })
      .catch((error) => {
        console.error("Ошибка при добавлении групп:", error);
        toast.error(
          "Не удалось добавить некоторые группы. Проверьте данные и попробуйте снова.",
        );
      });
  };

  const handleDeleteGroup = (id) => {
    if (window.confirm("Вы уверены, что хотите удалить эту группу?")) {
      deleteGroup(id)
        .then(() => {
          loadGroups();
          toast.success("Группа успешно удалена!");
        })
        .catch((error) => {
          console.error("Ошибка при удалении группы:", error);
          toast.error("Не удалось удалить группу. Попробуйте позже.");
        });
    }
  };

  return (
    <div className="container">
      <StepsNav currentStep={2} />
      <h1>Управление Группами</h1>
      <p>Здесь вы можете просматривать, добавлять и редактировать группы.</p>
      <div className="actions mb-3 d-flex justify-content-between">
        <button className="btn btn-primary" onClick={handleAddNewGroup}>
          Добавить группу
        </button>
        {newGroups.length > 0 && (
          <button className="btn btn-success" onClick={handleSaveAllNewGroups}>
            Сохранить все
          </button>
        )}
      </div>

      {groups.length === 0 && !loading && !error && newGroups.length === 0 && (
          <div className="alert alert-info">
            Пока нет ни одной сохранённой группы. Добавьте новую или импортируйте.
          </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Загрузка...</p>}

      {newGroups.length > 0 && (
        <div className="row mb-4">
          {newGroups.map((ng, index) => (
            <div key={`new-${index}`} className="col-md-4">
              <div className="card mb-3 position-relative">
                <button
                  className="btn btn-sm btn-danger position-absolute"
                  style={{ top: "5px", right: "5px" }}
                  onClick={() => handleRemoveNewGroup(index)}
                >
                  ✕
                </button>
                <div className="card-body">
                  <h5 className="card-title">Новая группа</h5>
                  <div className="mb-2">
                    <label className="form-label">Номер группы</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Например: 101"
                      value={ng.name}
                      onChange={(e) =>
                        handleNewGroupChange(index, e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {groups.length > 0 && (
        <div className="row">
          {groups.map((g) => (
            <div key={g.id} className="col-md-4">
              <div className="card mb-3 position-relative">
                <button
                  className="btn btn-sm btn-danger position-absolute"
                  style={{ top: "5px", right: "5px" }}
                  onClick={() => handleDeleteGroup(g.id)}
                >
                  ✕
                </button>
                <div className="card-body">
                  <h5 className="card-title">Группа: {g.name}</h5>
                  <Link
                    to={`/groups/${g.id}/edit`}
                    className="btn btn-sm btn-warning me-2"
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

export default GroupList;
