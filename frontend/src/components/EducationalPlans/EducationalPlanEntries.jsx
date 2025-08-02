function EducationalPlanEntries({
  entries,
  subjects,
  onAdd,
  onChange,
  onRemove,
}) {
  return (
    <div>
      <h3>Предметы и часы</h3>
      <p className="text-muted">
        Укажите для каждого предмета количество часов по типам &#34;УП&#34;, &#34;КЛ&#34;, &#34;ДК&#34;.
      </p>
      {entries.map((entry, index) => {
        const totalHours =
          (entry["УП"] || 0) + (entry["КЛ"] || 0) + (entry["ДК"] || 0);
        const isSubjectEmpty = !entry.subject;
        const isHoursEmpty = totalHours === 0;
        const isIncomplete = isSubjectEmpty || isHoursEmpty;

        return (
          <div
            key={index}
            className={`mb-3 p-2 ${isIncomplete ? "border border-warning" : ""}`}
          >
            <div className="row g-2 align-items-end">
              <div className="col-4">
                <label className="form-label">Предмет</label>
                <select
                  className="form-control"
                  value={entry.subject}
                  onChange={(e) => onChange(index, "subject", e.target.value)}
                  required
                >
                  <option value="">--Выберите предмет--</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              {["УП", "КЛ", "ДК"].map((field) => (
                <div key={field} className="col">
                  <label className="form-label">{field}</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={entry[field] || 0}
                    onChange={(e) =>
                      onChange(index, field, parseInt(e.target.value, 10) || 0)
                    }
                  />
                </div>
              ))}
              <div className="col-auto">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => onRemove(index)}
                >
                  Удалить
                </button>
              </div>
            </div>
            {isIncomplete && (
              <small className="text-warning">
                Заполните предмет и укажите хотя бы 1 час по одному из типов
                (УП, КЛ или ДК).
              </small>
            )}
          </div>
        );
      })}
      <button
        type="button"
        className="btn btn-outline-primary mb-3"
        onClick={onAdd}
      >
        Добавить предмет
      </button>
    </div>
  );
}

export default EducationalPlanEntries;
