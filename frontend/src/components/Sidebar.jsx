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
    const [isOpen, setIsOpen] = useState(false);

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
        <>
            <button className="mobile-menu-btn"
                    onClick={() => setIsOpen(!isOpen)}>
                <i className="fa-solid fa-bars"></i>
            </button>

            <div
                className={`sidebar bg-dark text-white ${isOpen ? 'open' : ''}`}>
                <button className="close-btn" onClick={() => setIsOpen(false)}>
                    <i className="fa-solid fa-times"></i>
                </button>
                <NavLink to="/" className="brand">
                    <span className="fs-4">ИС Расписание</span>
                </NavLink>
                <hr/>
                <ul className="nav flex-column">
                    {isAuthenticated ? (
                        <>
                            <li><NavLink to="/teachers"><i
                                className="fa-solid fa-user-tie"></i> Управление
                                сотрудниками</NavLink></li>
                            <li><NavLink to="/groups"><i
                                className="fa-solid fa-users"></i> Управление
                                группами</NavLink></li>
                            <li><NavLink to="/subjects"><i
                                className="fa-solid fa-book-open"></i> Дисциплины</NavLink>
                            </li>
                            <li><NavLink to="/teacher_subject_assignments"><i
                                className="fa-solid fa-handshake"></i> Назначение
                                дисциплин</NavLink></li>
                            <li><NavLink to="/educational_plans"><i
                                className="fa-solid fa-book"></i> Учебные планы</NavLink>
                            </li>
                            <li><NavLink to="/group_educational_plans"><i
                                className="fa-solid fa-link"></i> Привязки к
                                группам</NavLink></li>
                            <li><NavLink to="/brigade_assignments"><i
                                className="fa-solid fa-briefcase"></i> Назначения
                                бригад</NavLink></li>
                            <li><NavLink to="/teacher_unavailable_dates"><i
                                className="fa-solid fa-calendar-times"></i> Недоступные
                                даты</NavLink></li>
                            <li><NavLink to="/group_calendar"><i
                                className="fa-solid fa-calendar"></i> Календарь
                                Группы</NavLink></li>
                        </>
                    ) : (
                        <li><NavLink to="/login"><i
                            className="fa-solid fa-right-to-bracket"></i> Войти</NavLink>
                        </li>
                    )}
                </ul>
                <hr/>
                {isAuthenticated && (
                    <div className="user-info">
                        <img src={user.avatar || defaultAvatar} alt="Avatar"
                             className="avatar"/>
                        <strong>{user.username || 'Пользователь'}</strong>
                        <button onClick={logout} className="logout-btn"><i
                            className="fa-solid fa-right-from-bracket"></i> Выйти
                        </button>
                    </div>
                )}
            </div>

            <style>
                {`
                .mobile-menu-btn {
                    position: fixed;
                    top: 10px;
                    left: 10px;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    z-index: 1001;
                }

                .sidebar {
                    position: fixed;
                    top: 0;
                    left: -280px;
                    width: 280px;
                    height: 100vh;
                    background: #343a40;
                    transition: left 0.3s ease;
                    padding: 20px;
                    z-index: 1000;
                }

                .sidebar.open {
                    left: 0;
                }

                .close-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                }

                .nav li {
                    margin: 10px 0;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-top: 20px;
                }

                .avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 2px solid white;
                }
                `}
            </style>
        </>
    );
}

export default Sidebar;