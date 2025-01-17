import React from 'react';

function Home() {
    return (
        <div className="container">
            <h1>Добро пожаловать в систему управления расписанием</h1>
            <p>
                Это информационная система для составления и управления
                расписанием занятий. Возможности системы:
            </p>
            <ul>
                <li>Управление группами студентов: создание, редактирование,
                    удаление групп.
                </li>
                <li>Управление преподавателями: добавление новых
                    преподавателей, изменение информации, удаление.
                </li>
                <li>Составление расписания занятий с учётом бригад и временных
                    интервалов.
                </li>
                <li>Просмотр расписания для отдельных групп и преподавателей.
                </li>
                <li>Предотвращение конфликтов расписания при назначении
                    преподавателей и групп.
                </li>
            </ul>
            <p>
                Используйте меню навигации слева для доступа к необходимым
                разделам системы.
            </p>
        </div>
    );
}

export default Home;