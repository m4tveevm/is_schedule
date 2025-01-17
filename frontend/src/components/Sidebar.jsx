import React, {useContext, useState, useEffect} from 'react';
import {NavLink} from 'react-router-dom';
import {AuthContext} from '../context/AuthContext';
import {getUserProfile} from '../services/api';

function Sidebar() {
    const {authState, logout} = useContext(AuthContext);
    const {isAuthenticated} = authState;

    const [user, setUser] = useState({
        username: 'UserName',
        avatar: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            getUserProfile()
                .then((response) => {
                    setUser(response.data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Ошибка при получении данных пользователя:', error);
                    setLoading(false);
                });
        }
    }, [isAuthenticated]);

    const defaultAvatar = 'https://cdn2.iconfinder.com/data/icons/squircle-ui/32/Avatar-512.png';

    return (
        <div
            className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark sidebar"
            style={{width: '280px', height: '100vh'}}
        >
            <NavLink
                to="/"
                className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
            >
                <span className="fs-4">ИС Расписание</span>
            </NavLink>
            <hr/>
            <ul className="nav nav-pills flex-column mb-auto">
                {isAuthenticated ? (
                    <>
                        <li className="nav-item">
                            <NavLink
                                to="/teachers"
                                className={({isActive}) => 'nav-link text-white' + (isActive ? ' active' : '')}
                            >
                                <i className="fa-solid fa-user-tie"></i> Управление
                                сотрудниками
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/groups"
                                className={({isActive}) => 'nav-link text-white' + (isActive ? ' active' : '')}
                            >
                                <i className="fa-solid fa-users"></i> Управление
                                группами
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/subjects"
                                className={({isActive}) => 'nav-link text-white' + (isActive ? ' active' : '')}
                            >
                                <i className="fa-solid fa-book-open"></i> Дисциплины
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/teacher_subject_assignments"
                                className={({isActive}) => 'nav-link text-white' + (isActive ? ' active' : '')}
                            >
                                <i className="fa-solid fa-handshake"></i> Назначение
                                дисциплин
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/educational_plans"
                                className={({isActive}) => 'nav-link text-white' + (isActive ? ' active' : '')}
                            >
                                <i className="fa-solid fa-book"></i> Учебные
                                планы
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/group_educational_plans"
                                className={({isActive}) => 'nav-link text-white' + (isActive ? ' active' : '')}
                            >
                                <i className="fa-solid fa-link"></i> Привязки к
                                группам
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/brigade_assignments"
                                className={({isActive}) => 'nav-link text-white' + (isActive ? ' active' : '')}
                            >
                                <i className="fa-solid fa-briefcase"></i> Назначения
                                бригад
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/teacher_unavailable_dates"
                                className={({isActive}) => 'nav-link text-white' + (isActive ? ' active' : '')}
                            >
                                <i className="fa-solid fa-calendar-times"></i> Недоступные
                                даты
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/group_calendar"
                                className={({isActive}) => 'nav-link text-white' + (isActive ? ' active' : '')}
                            >
                                <i className="fa-solid fa-calendar"></i> Календарь
                                Группы
                            </NavLink>
                        </li>
                    </>
                ) : (
                    <li className="nav-item">
                        <NavLink
                            to="/login"
                            className={({isActive}) => 'nav-link text-white' + (isActive ? ' active' : '')}
                        >
                            <i className="fa-solid fa-right-to-bracket"></i> Войти
                        </NavLink>
                    </li>
                )}
            </ul>
            <hr/>
            <div className="dropdown">
                {isAuthenticated ? (
                    <button
                        className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
                        id="dropdownUser1"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            fontSize: 'inherit',
                            lineHeight: 'inherit',
                            cursor: 'pointer',
                        }}
                    >
                        <img
                            src={user.avatar || defaultAvatar}
                            alt="Avatar"
                            className="rounded-circle me-2"
                            style={{
                                width: '32px',
                                height: '32px',
                                border: '2px solid #fff',
                            }}
                        />
                        <strong>{user.username || 'Пользователь'}</strong>
                    </button>
                ) : (
                    <NavLink
                        to="/login"
                        className="d-flex align-items-center text-white text-decoration-none"
                    >
                        <img
                            src={defaultAvatar}
                            alt="Аватар"
                            width="32"
                            height="32"
                            className="rounded-circle me-2"
                        />
                        <strong>Войти</strong>
                    </NavLink>
                )}
                {isAuthenticated && (
                    <ul
                        className="dropdown-menu dropdown-menu-dark text-small shadow"
                        aria-labelledby="dropdownUser1"
                    >
                        <li>
                            <NavLink className="dropdown-item" to="/profile">
                                <i className="fa-solid fa-user"></i> Профиль
                            </NavLink>
                        </li>
                        <li>
                            <NavLink className="dropdown-item" to="/settings">
                                <i className="fa-solid fa-gear"></i> Настройки
                            </NavLink>
                        </li>
                        <li>
                            <hr className="dropdown-divider"/>
                        </li>
                        <li>
                            <button
                                className="dropdown-item"
                                onClick={logout}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    padding: 0,
                                    color: 'inherit',
                                }}
                            >
                                <i className="fa-solid fa-right-from-bracket"></i> Выйти
                            </button>
                        </li>
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Sidebar;