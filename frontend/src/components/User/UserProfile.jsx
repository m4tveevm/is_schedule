import React, { useState, useEffect } from "react";
import { getUserProfile, updateProfilePicture } from "../../services/api";

function UserProfile() {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  const defaultAvatar =
    "https://cdn2.iconfinder.com/data/icons/squircle-ui/32/Avatar-512.png";

  useEffect(() => {
    getUserProfile()
      .then((response) => {
        setUser(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Ошибка при загрузке профиля пользователя:", error);
        setLoading(false);
      });
  }, []);

  const handlePictureUpdate = async () => {
    if (!avatarUrl.trim()) return;

    try {
      const response = await updateProfilePicture({ avatar_url: avatarUrl });
      setUser({ ...user, avatar: response.data.avatar });
      setAvatarUrl("");
      setShowModal(false);
    } catch (error) {
      console.error("Ошибка при обновлении аватара:", error);
      alert("Не удалось обновить аватар. Проверьте URL.");
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="card text-center p-4" style={{ width: "350px" }}>
        {loading && <p>Загрузка...</p>}
        <img
          src={user.avatar || defaultAvatar}
          alt="Avatar"
          className="rounded-circle mx-auto"
          style={{ width: "100px", height: "100px" }}
        />
        <h4 className="mt-3">{user.name}</h4>
        <p className="text-muted">@{user.username}</p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-outline-primary btn-sm mt-2"
        >
          Изменить фото профиля
        </button>
        <hr className="my-4" />
        <div>
          <button className="btn btn-primary btn-sm">
            Редактировать профиль
          </button>
        </div>
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Обновить фото профиля</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>Введите URL изображения:</p>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePictureUpdate}
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
