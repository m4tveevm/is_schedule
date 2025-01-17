import React, {useEffect, useState} from 'react';
import {getGroups, getLectures} from '../../services/api';

function GroupSchedule() {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [lectures, setLectures] = useState([]);

    useEffect(() => {
        getGroups()
            .then((response) => {
                setGroups(response.data);
                if (response.data.length > 0) {
                    setSelectedGroup(response.data[0].id.toString());
                }
            })
            .catch((error) => console.error('Ошибка при загрузке групп:', error));
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            getLectures({group: selectedGroup})
                .then((response) => setLectures(response.data))
                .catch((error) => console.error('Ошибка при загрузке лекций:', error));
        }
    }, [selectedGroup]);

    const handleGroupChange = (e) => {
        setSelectedGroup(e.target.value);
    };

    return (
        <div>
            <h1>Расписание для группы</h1>
            <form>
                <div className="form-group">
                    <label>Выберите группу:</label>
                    <select
                        className="form-control"
                        value={selectedGroup}
                        onChange={handleGroupChange}
                    >
                        {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </select>
                </div>
            </form>
            <table className="table mt-3">
                <thead>
                <tr>
                    <th>Дата</th>
                    <th>Время</th>
                    <th>Бригада</th>
                    <th>Преподаватель</th>
                </tr>
                </thead>
                <tbody>
                {lectures.length > 0 ? (
                    lectures.map((lecture) => (
                        <tr key={lecture.id}>
                            <td>{lecture.schedule_date.date}</td>
                            <td>
                                {lecture.time_slot === 'morning' ? '9:30 - 12:30' : '13:30 - 16:30'}
                            </td>
                            <td>{lecture.brigade_number}</td>
                            <td>{lecture.teacher.name}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4">Нет запланированных занятий.</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}

export default GroupSchedule;