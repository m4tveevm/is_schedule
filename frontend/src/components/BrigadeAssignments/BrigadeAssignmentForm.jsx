import {useState, useEffect, useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {
    getBrigadeAssignmentsBulk,
    getEducationalPlanEntriesByGroupPlan,
    searchGroupEducationalPlans,
    searchTeachers,
    bulkUpdateBrigadeAssignments,
} from "../../services/api";
import StepsNav from "../StepsNav";
import {toast} from "react-toastify";
import PropTypes from "prop-types";

function normalizeArray(maybeArray) {
    return Array.isArray(maybeArray) ? maybeArray : [];
}

function SearchSuggestions({suggestions = [], activeIndex = -1, onSelect}) {
    const list = normalizeArray(suggestions);
    if (list.length === 0) return null;
    return (
        <ul className="list-group position-absolute w-100" style={{zIndex: 999, top: "100%"}}>
            {list.map((item, idx) => {
                const isGroupPlan = item.group_name || item.educational_plan_name || item.group;
                const label = isGroupPlan
                    ? `${item.group_name || item.group?.name || item.group || "Группа"} - ${
                        item.educational_plan_name || item.educational_plan?.title || item.educational_plan || "План"
                    }`
                    : item.shortname || item.name || item.title || "—";
                return (
                    <li
                        key={item.id ?? `${label}-${idx}`}
                        className={`list-group-item ${idx === activeIndex ? "active" : ""}`}
                        onMouseDown={() => onSelect(item)}
                        style={{cursor: "pointer"}}
                    >
                        {label}
                    </li>
                );
            })}
        </ul>
    );
}

SearchSuggestions.propTypes = {
    suggestions: PropTypes.array,
    activeIndex: PropTypes.number,
    onSelect: PropTypes.func.isRequired,
};

export function BrigadeAssignmentForm() {
    const navigate = useNavigate();

    const [groupPlanQuery, setGroupPlanQuery] = useState("");
    const [groupPlanSuggestions, setGroupPlanSuggestions] = useState([]);
    const [groupPlanActiveIndex, setGroupPlanActiveIndex] = useState(-1);

    const [groupEducationalPlan, setGroupEducationalPlan] = useState("");
    const [educationalPlanEntry, setEducationalPlanEntry] = useState("");
    const [entries, setEntries] = useState([]);

    const [saving, setSaving] = useState(false);

    const [brigades, setBrigades] = useState([
        {
            brigade_number: 1,
            teacher: "",
            teacherQuery: "",
            teacherSuggestions: [],
            _activeIndex: -1
        },
        {
            brigade_number: 2,
            teacher: "",
            teacherQuery: "",
            teacherSuggestions: [],
            _activeIndex: -1
        },
        {
            brigade_number: 3,
            teacher: "",
            teacherQuery: "",
            teacherSuggestions: [],
            _activeIndex: -1
        },
    ]);

    const readyToEdit = useMemo(
        () => !!groupEducationalPlan && !!educationalPlanEntry,
        [groupEducationalPlan, educationalPlanEntry]
    );

    // Поиск GEP для подсказок — наш searchGroupEducationalPlans возвращает МАССИВ
    useEffect(() => {
        if (!groupPlanQuery) {
            setGroupPlanSuggestions([]);
            setGroupPlanActiveIndex(-1);
            return;
        }
        let aborted = false;
        searchGroupEducationalPlans(groupPlanQuery)
            .then((items) => {
                if (aborted) return;
                setGroupPlanSuggestions(normalizeArray(items));
            })
            .catch((err) => {
                console.error(err);
                if (!aborted) setGroupPlanSuggestions([]);
            });
        return () => {
            aborted = true;
        };
    }, [groupPlanQuery]);

    // Получение записей плана по GEP.id — используем новый хелпер getEducationalPlanEntriesByGroupPlan
    useEffect(() => {
        if (!groupEducationalPlan) return;
        getEducationalPlanEntriesByGroupPlan(groupEducationalPlan)
            .then(({data}) => setEntries(normalizeArray(data)))
            .catch((err) => {
                console.error(err);
                setEntries([]);
            });
    }, [groupEducationalPlan]);

    // Подтягиваем назначения бригад для выбранной записи
    useEffect(() => {
        if (!readyToEdit) return;
        let aborted = false;

        getBrigadeAssignmentsBulk(groupEducationalPlan, educationalPlanEntry)
            .then(({data}) => {
                if (aborted) return;
                const server = normalizeArray(data);
                setBrigades((prev) =>
                    prev.map((b) => {
                        const found = server.find((d) => d.brigade_number === b.brigade_number);
                        if (!found) return b;
                        return {
                            ...b,
                            teacher: found.teacher || "",
                            teacherQuery: found.teacher_name || "",
                            teacherSuggestions: [],
                            _activeIndex: -1,
                        };
                    })
                );
            })
            .catch((err) => console.error(err));

        return () => {
            aborted = true;
        };
    }, [groupEducationalPlan, educationalPlanEntry, readyToEdit]);

    function handleGroupPlanKeyDown(e) {
        const list = normalizeArray(groupPlanSuggestions);
        if (!list.length) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setGroupPlanActiveIndex((i) => Math.min(i + 1, list.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setGroupPlanActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (groupPlanActiveIndex >= 0) {
                selectGroupPlan(list[groupPlanActiveIndex]);
            }
        }
    }

    function selectGroupPlan(plan) {
        const planId = plan?.id ?? "";
        const groupName = plan.group_name || plan.group?.name || plan.group || "";
        const planTitle = plan.educational_plan_name || plan.educational_plan?.title || plan.educational_plan || "";
        setGroupEducationalPlan(String(planId));
        setGroupPlanQuery([groupName, planTitle].filter(Boolean).join(" – ") || String(planId));
        setGroupPlanSuggestions([]);
        setGroupPlanActiveIndex(-1);
        setEducationalPlanEntry("");
    }

    function handleTeacherQueryChange(e, idx) {
        const q = e.target.value;
        setBrigades((bs) =>
            bs.map((b, i) =>
                i === idx
                    ? {...b, teacherQuery: q, teacher: "", teacherSuggestions: [], _activeIndex: -1}
                    : b
            )
        );
        if (!q) return;
        // Наш searchTeachers возвращает МАССИВ
        searchTeachers(q)
            .then((list) => {
                const arr = normalizeArray(list);
                setBrigades((bs) => bs.map((b, i) => (i === idx ? {
                    ...b,
                    teacherSuggestions: arr,
                    _activeIndex: -1
                } : b)));
            })
            .catch((err) => console.error(err));
    }

    function handleTeacherKeyDown(e, idx) {
        const bag = brigades[idx] || {};
        const list = normalizeArray(bag.teacherSuggestions);
        if (!list.length) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setBrigades((bs) =>
                bs.map((b, i) => (i === idx ? {
                    ...b,
                    _activeIndex: Math.min((b._activeIndex ?? -1) + 1, list.length - 1)
                } : b))
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setBrigades((bs) => bs.map((b, i) => (i === idx ? {
                ...b,
                _activeIndex: Math.max((b._activeIndex ?? -1) - 1, 0)
            } : b)));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const pick = (bag._activeIndex ?? -1) >= 0 ? list[bag._activeIndex] : null;
            if (pick) selectTeacher(pick, idx);
        }
    }

    function hideSuggestionsLater(idx) {
        setTimeout(() => {
            setBrigades((bs) => bs.map((b, i) => (i === idx ? {
                ...b,
                teacherSuggestions: [],
                _activeIndex: -1
            } : b)));
        }, 80);
    }

    function selectTeacher(t, idx) {
        setBrigades((bs) =>
            bs.map((b, i) => (i === idx ? {
                ...b,
                teacher: t.id,
                teacherQuery: t.shortname || t.name || "",
                teacherSuggestions: [],
                _activeIndex: -1
            } : b))
        );
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!groupEducationalPlan || !educationalPlanEntry) return;
        const payload = {
            group_educational_plan: Number(groupEducationalPlan),
            educational_plan_entry: Number(educationalPlanEntry),
            brigades: brigades.map((b) => ({
                brigade_number: b.brigade_number,
                teacher: b.teacher || null
            })),
        };
        try {
            setSaving(true);
            await bulkUpdateBrigadeAssignments(payload);
            toast.success("Назначения сохранены");
            navigate("/brigade_assignments");
        } catch (err) {
            console.error(err);
            toast.error("Ошибка сохранения");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="container mt-4">
            <StepsNav currentStep={7}/>
            <h1>{groupEducationalPlan && educationalPlanEntry ? "Редактировать назначения" : "Добавить назначения"}</h1>

            {!groupEducationalPlan && (
                <div className="form-group mb-3 position-relative">
                    <label>Группа и учебный план</label>
                    <input
                        type="text"
                        className="form-control"
                        value={groupPlanQuery}
                        onChange={(e) => setGroupPlanQuery(e.target.value)}
                        onKeyDown={handleGroupPlanKeyDown}
                        placeholder="Начните вводить..."
                        required
                        autoComplete="off"
                    />
                    <SearchSuggestions suggestions={groupPlanSuggestions}
                                       activeIndex={groupPlanActiveIndex}
                                       onSelect={selectGroupPlan}/>
                </div>
            )}

            {groupEducationalPlan && (
                <div className="form-group mb-3">
                    <label>Дисциплина / занятие</label>
                    <select
                        className="form-select"
                        value={educationalPlanEntry}
                        onChange={(e) => setEducationalPlanEntry(e.target.value)}
                        disabled={!normalizeArray(entries).length}
                        required
                    >
                        <option value="">-- выберите --</option>
                        {normalizeArray(entries).map((e) => (
                            <option key={e.id} value={e.id}>
                                {e.subject_name} ({e.lesson_type})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {readyToEdit && (
                <>
                    <h3 className="mt-4">Назначения бригад</h3>
                    {brigades.map((b, idx) => (
                        <div key={b.brigade_number} className="mb-3 position-relative">
                            <label className="form-label">Бригада {b.brigade_number}</label>
                            <input
                                type="text"
                                className="form-control"
                                value={b.teacherQuery}
                                onChange={(e) => handleTeacherQueryChange(e, idx)}
                                onKeyDown={(e) => handleTeacherKeyDown(e, idx)}
                                onBlur={() => hideSuggestionsLater(idx)}
                                placeholder="Введите преподавателя..."
                                autoComplete="off"
                            />
                            <SearchSuggestions suggestions={b.teacherSuggestions}
                                               activeIndex={b._activeIndex}
                                               onSelect={(t) => selectTeacher(t, idx)}/>
                        </div>
                    ))}

                    <div className="d-flex justify-content-end mt-4">
                        <button className="btn btn-success" onClick={handleSubmit}
                                disabled={saving}>
                            {saving ? "Сохраняем..." : "Сохранить"}
                        </button>
                        <button className="btn btn-secondary ms-2"
                                onClick={() => navigate("/brigade_assignments")} disabled={saving}>
                            Отмена
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default BrigadeAssignmentForm;