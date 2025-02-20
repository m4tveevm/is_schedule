import React, { useState } from "react";
import { createTeacherProfile, deleteTeacherProfile } from "../../services/api";
import { toast } from "react-toastify";

function TeacherAssignmentCard({
  teacher,
  assignments,
  subjects,
  onDataChange,
}) {
  const [newSubjectId, setNewSubjectId] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingAssignmentId, setDeletingAssignmentId] = useState(null);

  const assignedSubjectIds = assignments.map((a) => a.subject);
  const availableSubjects = subjects.filter(
    (s) => !assignedSubjectIds.includes(s.id),
  );

  const handleAdd = async () => {
    if (!newSubjectId) {
      toast.info("Выберите дисциплину для добавления.");
      return;
    }
    setAdding(true);
    const data = {
      teacher: teacher.id,
      subject: newSubjectId,
    };
    try {
      await createTeacherProfile(data);
      toast.success("Дисциплина успешно добавлена!");
      setNewSubjectId("");
      onDataChange();
    } catch (err) {
      console.error("Ошибка при добавлении дисциплины:", err);
      toast.error(
        "Не удалось добавить дисциплину. Проверьте данные и попробуйте снова.",
      );
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (window.confirm("Вы уверены, что хотите удалить эту дисциплину?")) {
      setDeletingAssignmentId(assignmentId);
      try {
        await deleteTeacherProfile(assignmentId);
        toast.success("Дисциплина успешно удалена!");
        onDataChange();
      } catch (err) {
        console.error("Ошибка при удалении дисциплины:", err);
        toast.error("Не удалось удалить дисциплину. Попробуйте позже.");
      } finally {
        setDeletingAssignmentId(null);
      }
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-header">
        <strong>
          {teacher.shortname || `${teacher.surname} ${teacher.name}`}
        </strong>
      </div>
      <div className="card-body">
        <h6>Дисциплины:</h6>
        {assignments.length === 0 ? (
          <p>Нет назначенных дисциплин.</p>
        ) : (
          <ul className="list-group mb-3">
            {assignments.map((assignment) => (
              <li
                key={assignment.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {assignment.subject_name}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(assignment.id)}
                  disabled={deletingAssignmentId === assignment.id}
                >
                  {deletingAssignmentId === assignment.id
                    ? "Удаление..."
                    : "Удалить"}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="d-flex align-items-center">
          <select
            className="form-control me-2"
            value={newSubjectId}
            onChange={(e) => setNewSubjectId(e.target.value)}
          >
            <option value="">-- Выберите дисциплину --</option>
            {availableSubjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <button
            className="btn btn-success"
            onClick={handleAdd}
            disabled={adding}
          >
            {adding ? "Добавление..." : "Добавить дисциплину"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherAssignmentCard;
