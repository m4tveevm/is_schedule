import axios from "axios";

export const API_BASE_URL = "__REACT_APP_API_URL__";

/* ============================================================
   Аутентификация & Общие настройки
============================================================ */

export const obtainToken = (username, password) => {
  return axios.post(`${API_BASE_URL}token/`, { username, password });
};

export const refreshToken = (refreshToken) => {
  return axios.post(`${API_BASE_URL}token/refresh/`, { refresh: refreshToken });
};

export const setupAxiosInterceptors = (logout) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        logout();
        window.location.href = "/login";
      }
      return Promise.reject(error);
    },
  );
};

export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

/* ============================================================
   Преподаватели
============================================================ */

export const uploadTeachers = (formData) =>
  axios.post(`${API_BASE_URL}teachers/import_teachers/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getTeachers = () => axios.get(`${API_BASE_URL}teachers/`);
export const getTeacherById = (id) => axios.get(`${API_BASE_URL}teachers/${id}/`);
export const createTeacher = (data) => axios.post(`${API_BASE_URL}teachers/`, data);
export const updateTeacher = (id, data) => axios.put(`${API_BASE_URL}teachers/${id}/`, data);
export const deleteTeacher = (id) => axios.delete(`${API_BASE_URL}teachers/${id}/`);

export const searchTeachers = (query) =>
  axios
    .get(`${API_BASE_URL}teachers/?search=${encodeURIComponent(query)}`)
    .then((res) => res.data);

export const getTeacherUnavailableDates = (teacherId) => {
  return axios.get(`${API_BASE_URL}teacher_unavailable_dates/?teacher_id=${teacherId}`);
};

export const createTeacherUnavailableDates = (teacherId, dates) => {
  return axios.post(`${API_BASE_URL}teacher_unavailable_dates/`, { teacher_id: teacherId, dates });
};

export const updateTeacherUnavailableDates = (id, teacherId, dates) => {
  return axios.put(`${API_BASE_URL}teacher_unavailable_dates/${id}/`, { teacher_id: teacherId, dates });
};

// Профили преподавателей
export const getTeacherProfiles = () => axios.get(`${API_BASE_URL}teacher_profiles/`);
export const createTeacherProfile = (data) => axios.post(`${API_BASE_URL}teacher_profiles/`, data);
export const deleteTeacherProfile = (id) => axios.delete(`${API_BASE_URL}teacher_profiles/${id}/`);

// Группы
export const getGroups = () => axios.get(`${API_BASE_URL}groups/`);
export const getGroupById = (id) => axios.get(`${API_BASE_URL}groups/${id}/`);
export const createGroup = (data) => axios.post(`${API_BASE_URL}groups/`, data);
export const updateGroup = (id, data) => axios.put(`${API_BASE_URL}groups/${id}/`, data);
export const deleteGroup = (id) => axios.delete(`${API_BASE_URL}groups/${id}/`);

// Расписание (Лекции)

export const createLecture = (data) => axios.post(`${API_BASE_URL}lectures/`, data);
export const getLectures = (params) => axios.get(`${API_BASE_URL}lectures/`, { params });

// Дополнительные API
export const getLessonTypes = () => axios.get(`${API_BASE_URL}lesson_types/`);

// Предметы
export const getSubjects = () => axios.get(`${API_BASE_URL}subjects/`);
export const getSubjectById = (id) => axios.get(`${API_BASE_URL}subjects/${id}/`);
export const createSubject = (data) => axios.post(`${API_BASE_URL}subjects/`, data);
export const updateSubject = (id, data) => axios.put(`${API_BASE_URL}subjects/${id}/`, data);
export const deleteSubject = (id) => axios.delete(`${API_BASE_URL}subjects/${id}/`);

// Учебные планы
export const getEducationalPlans = () => axios.get(`${API_BASE_URL}educational_plans/`);
export const getEducationalPlanById = (id) => axios.get(`${API_BASE_URL}educational_plans/${id}/`);
export const createEducationalPlan = (data) => axios.post(`${API_BASE_URL}educational_plans/`, data);
export const updateEducationalPlan = (id, data) => axios.put(`${API_BASE_URL}educational_plans/${id}/`, data);
export const deleteEducationalPlan = (id) => axios.delete(`${API_BASE_URL}educational_plans/${id}/`);
export const searchEducationalPlans = (query) =>
  axios.get(`${API_BASE_URL}educational_plans/?search=${encodeURIComponent(query)}`);

// Привязки учебных планов к группам
export const getGroupEducationalPlans = () => axios.get(`${API_BASE_URL}group_educational_plans/`);
export const getGroupEducationalPlanById = (id) => axios.get(`${API_BASE_URL}group_educational_plans/${id}/`);
export const createGroupEducationalPlan = (data) => axios.post(`${API_BASE_URL}group_educational_plans/`, data);
export const updateGroupEducationalPlan = (id, data) => axios.put(`${API_BASE_URL}group_educational_plans/${id}/`, data);
export const deleteGroupEducationalPlan = (id) => axios.delete(`${API_BASE_URL}group_educational_plans/${id}/`);
export const searchGroupEducationalPlans = (query) =>
  axios
    .get(`${API_BASE_URL}group_educational_plans/?search=${encodeURIComponent(query)}`)
    .then((res) => res.data);

// Записи учебного плана
export const getEducationalPlanEntries = (planId) =>
  axios.get(`${API_BASE_URL}educational_plans/${planId}/entries/`);

// Назначения бригад
export const getBrigadeAssignments = () => axios.get(`${API_BASE_URL}brigade_assignments/`);
export const getBrigadeAssignmentsBulk = (groupId, planEntryId) =>
  axios.get(
    `${API_BASE_URL}brigade_assignments/bulk_get/?group_educational_plan=${groupId}&educational_plan_entry=${planEntryId}`,
  );
export const bulkUpdateBrigadeAssignments = (data) =>
  axios.post(`${API_BASE_URL}brigade_assignments/bulk_update/`, data);
export const bulkDeleteBrigadeAssignments = (data) =>
  axios.post(`${API_BASE_URL}brigade_assignments/bulk_delete/`, data);

// Профиль пользователя
export const getUserProfile = () => axios.get(`${API_BASE_URL}user/profile/`);
export const updateProfilePicture = (data) =>
  axios.post("/api/user/profile/upload_avatar/", data);
export const updateUserSettings = (data) =>
  axios.put(`${API_BASE_URL}user/settings/`, data);
