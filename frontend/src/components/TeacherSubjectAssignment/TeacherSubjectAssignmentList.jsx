import { useContext, useEffect, useState } from "react";
import {
  getTeachers,
  getTeacherProfiles,
  getSubjects,
} from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import StepsNav from "../StepsNav";
import { toast } from "react-toastify";
import TeacherAssignmentCard from "./TeacherAssignmentCard";

function TeacherAssignmentsUnifiedList() {
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleUnauthorized = () => {
    logout();
    navigate("/login");
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [teachersRes, assignmentsRes, subjectsRes] = await Promise.all([
        getTeachers(),
        getTeacherProfiles(),
        getSubjects(),
      ]);
      setTeachers(teachersRes.data);
      setAssignments(assignmentsRes.data);
      setSubjects(subjectsRes.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        handleUnauthorized();
      } else {
        console.error(err);
        setError("Не удалось загрузить данные. Попробуйте позже.");
        toast.error("Не удалось загрузить данные. Попробуйте позже.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="container">
      <StepsNav currentStep={4} />
      <h1>Назначения дисциплин преподавателям</h1>
      {loading && <p>Загрузка данных...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && teachers.length === 0 && (
        <div className="alert alert-info">Нет преподавателей.</div>
      )}
      <div className="row">
        {teachers.map((teacher) => {
          const teacherAssignments = assignments.filter(
            (a) => a.teacher === teacher.id,
          );
          return (
            <div key={teacher.id} className="col-md-6">
              <TeacherAssignmentCard
                teacher={teacher}
                assignments={teacherAssignments}
                subjects={subjects}
                onDataChange={loadData}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TeacherAssignmentsUnifiedList;
