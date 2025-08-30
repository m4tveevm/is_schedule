import axios from "axios";

export const API_BASE_URL = "__REACT_APP_API_URL__"; // Должен оканчиваться на "/api/"

// =============================
// Session (headless) + JWT pair
// =============================
export const setSessionToken = (sessionToken) => {
    if (sessionToken) {
        axios.defaults.headers.common["X-Session-Token"] = sessionToken;
    } else {
        delete axios.defaults.headers.common["X-Session-Token"];
    }
};

export const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common["Authorization"];
    }
};

export const headlessLogin = (username, password) =>
    axios.post(`${API_BASE_URL}headless/login`, {username, password});

export const jwtFromSession = () => axios.post(`${API_BASE_URL}auth/jwt/from_session`);

export const refreshPair = (refresh) => axios.post(`${API_BASE_URL}auth/refresh`, {refresh});

export const logoutSession = () => axios.post(`${API_BASE_URL}auth/logout`);

export const me = () => axios.get(`${API_BASE_URL}auth/me`);

// =============================
// Axios interceptors
// =============================
export const setupAxiosInterceptors = (onHardLogout) => {
    axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const cfg = error?.config || {};
            const status = error?.response?.status;
            const isAuthRefresh = cfg?.url?.includes("/auth/refresh");
            const isHeadless = cfg?.url?.includes("/headless/");

            if (status === 401 && !cfg._retry && !isAuthRefresh && !isHeadless) {
                // Пытаемся освежить JWT
                try {
                    cfg._retry = true;
                    const storedRefresh = localStorage.getItem("refreshToken");
                    if (!storedRefresh) throw new Error("no refresh token");
                    const {data} = await refreshPair(storedRefresh);
                    const newAccess = data?.access;
                    const newRefresh = data?.refresh; // ninja-jwt возвращает новую пару
                    if (newAccess) {
                        localStorage.setItem("accessToken", newAccess);
                        setAuthToken(newAccess);
                        if (newRefresh) localStorage.setItem("refreshToken", newRefresh);
                        cfg.headers = cfg.headers || {};
                        cfg.headers["Authorization"] = `Bearer ${newAccess}`;
                        return axios(cfg);
                    }
                } catch (e) {
                    // Падаем в жёсткий logout
                }
                onHardLogout?.();
                window.location.href = "/login";
            }
            return Promise.reject(error);
        }
    );
};

/* ============================================================
   Доменные вызовы (Brigades / Plans / GroupPlans / Teachers)
============================================================ */

// Brigades
export const getBrigadeAssignments = (q) =>
    axios.get(`${API_BASE_URL}brigade_assignments`, {params: q ? {q} : {}});

export const getBrigadeAssignmentsBulk = (groupId, planEntryId) =>
    axios.get(`${API_BASE_URL}brigade_assignments/bulk`, {
        params: {group_educational_plan: groupId, educational_plan_entry: planEntryId},
    });

// Новый основной upsert — POST "/brigade_assignments"; алиас оставим для совместимости
export const bulkUpdateBrigadeAssignments = (data) =>
    axios.post(`${API_BASE_URL}brigade_assignments`, data);

export const bulkDeleteBrigadeAssignments = (data) =>
    axios.post(`${API_BASE_URL}brigade_assignments/bulk_delete`, data);

// Plans
export const getEducationalPlanEntriesByGroupPlan = (groupEducationalPlanId) =>
    axios.get(`${API_BASE_URL}educational_plans/entries_by_group_plan`, {
        params: {group_educational_plan: groupEducationalPlanId},
    });

// Group Plans (поиск для подсказок)
export const searchGroupEducationalPlans = (query) =>
    axios
        .get(`${API_BASE_URL}group_educational_plans/search`, {params: {q: query}})
        .then((r) => r.data);

// Teachers (поиск для подсказок)
export const searchTeachers = (query, groupId = null) =>
    axios
        .get(`${API_BASE_URL}teachers/search`, {params: {q: query, group_id: groupId}})
        .then((r) => r.data);

export const obtainToken = (username, password) => axios.post(`${API_BASE_URL}token/`, {
    username: username,
    password: password
});


export const refreshToken = (refreshToken) => {
    return axios.post(`${API_BASE_URL}token/refresh/`, {refresh: refreshToken});
};


/* ============================================================
   Преподаватели
============================================================ */

export const uploadTeachers = (formData) => axios.post(`${API_BASE_URL}teachers/import_teachers/`, formData, {
    headers: {
        "Content-Type": "multipart/form-data",
    },
});

export const getTeachers = () => axios.get(`${API_BASE_URL}teachers/`);
export const getTeacherById = (id) => axios.get(`${API_BASE_URL}teachers/${id}/`);
export const createTeacher = (data) => axios.post(`${API_BASE_URL}teachers/`, data);
export const updateTeacher = (id, data) => axios.put(`${API_BASE_URL}teachers/${id}/`, data);
export const deleteTeacher = (id) => axios.delete(`${API_BASE_URL}teachers/${id}/`);


export const getTeacherUnavailableDates = (teacherId) => {
    return axios.get(`${API_BASE_URL}teacher_unavailable_dates/?teacher_id=${teacherId}`);
};

export const createTeacherUnavailableDates = (teacherId, dates) => {
    return axios.post(`${API_BASE_URL}teacher_unavailable_dates/`, {teacher_id: teacherId, dates});
};

export const updateTeacherUnavailableDates = (id, teacherId, dates) => {
    return axios.put(`${API_BASE_URL}teacher_unavailable_dates/${id}/`, {
        teacher_id: teacherId,
        dates
    });
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
export const getLectures = (params) => axios.get(`${API_BASE_URL}lectures/`, {params});

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
export const searchEducationalPlans = (query) => axios.get(`${API_BASE_URL}educational_plans/?search=${encodeURIComponent(query)}`);

// Привязки учебных планов к группам
export const getGroupEducationalPlans = () => axios.get(`${API_BASE_URL}group_educational_plans/`);
export const getGroupEducationalPlanById = (id) => axios.get(`${API_BASE_URL}group_educational_plans/${id}/`);
export const createGroupEducationalPlan = (data) => axios.post(`${API_BASE_URL}group_educational_plans/`, data);
export const updateGroupEducationalPlan = (id, data) => axios.put(`${API_BASE_URL}group_educational_plans/${id}/`, data);
export const deleteGroupEducationalPlan = (id) => axios.delete(`${API_BASE_URL}group_educational_plans/${id}/`);

// Записи учебного плана
export const getEducationalPlanEntries = (planId) => axios.get(`${API_BASE_URL}educational_plans/${planId}/entries/`);

// Профиль пользователя
export const getUserProfile = () => axios.get(`${API_BASE_URL}user/profile/`);
export const updateProfilePicture = (formData) => axios.post("/user/profile/upload_avatar/", formData, {
    headers: {"Content-Type": "multipart/form-data"},
});


export const updateUserSettings = (data) => axios.put(`${API_BASE_URL}user/settings/`, data);
