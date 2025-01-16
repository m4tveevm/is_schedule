import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {getGroupById, createGroup, updateGroup} from '../../services/api';
import StepsNav from '../StepsNav';

function GroupForm() {
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const {id} = useParams();

    useEffect(() => {
        if (id) {
            getGroupById(id)
                .then((response) => {
                    setName(response.data.name || '');
                })
                .catch((error) => {
                    console.error('Ошибка при загрузке группы:', error);
                });
        }
    }, [id]);

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = {name};

        const request = id ? updateGroup(id, data) : createGroup(data);

        request
            .then(() => {
                navigate('/groups');
            })
            .catch((error) => {
                console.error('Ошибка при сохранении группы:', error);
            });
    };

    const handleCancel = () => {
        navigate('/groups');
    };

    return (
        <div className="container mt-4">
            <StepsNav currentStep={2}/>
            <h1>{id ? 'Редактировать группу' : 'Добавить группу'}</h1>
            <p className="text-muted">
                {id ? 'Измените номер группы и сохраните.' : 'Введите номер новой группы и нажмите "Сохранить".'}
            </p>
            <div className="card mt-4"
                 style={{maxWidth: '600px', margin: '0 auto'}}>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group mb-3">
                            <label className="form-label" htmlFor="groupName">Номер
                                группы</label>
                            <input
                                type="text"
                                id="groupName"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Например: 101"
                            />
                        </div>
                        <div className="d-flex justify-content-end mt-4">
                            <button type="submit"
                                    className="btn btn-success">Сохранить
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary ms-2"
                                onClick={handleCancel}
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

export default GroupForm;
