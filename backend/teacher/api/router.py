from __future__ import annotations
from typing import List, Optional, Tuple

from django.shortcuts import get_object_or_404
from ninja import Router, Query, Body
from ninja.errors import HttpError
from django.db import transaction, models
from django.db.models import Q
import pandas as pd
from teacher.models import Teacher
from subject.models import Subject
from educational_plan.models import EducationalPlanEntry
from group_educational_plan.models import GroupEducationalPlan

from teacher_profile.models import TeacherProfile
from teacher.transport.schemas import TeacherOut, Message

router = Router(tags=["Teachers"])

EMPLOYER_ALLOWED = {"Основной", "Совместитель"}


def _norm_employer(v: Optional[str]) -> str:
    s = (v or "").strip()
    if s in EMPLOYER_ALLOWED:
        return s
    low = s.lower()
    if low in {"свой", "основное место работы", "main", "primary"}:
        return "Основной"
    if low in {"внешний", "совместитель", "contributor", "external"}:
        return "Совместитель"
    return Teacher.CONTRIBUTOR


def _row(t: Teacher) -> TeacherOut:
    return TeacherOut(
        id=t.id,
        surname=t.surname,
        name=t.name,
        lastname=t.lastname,
        shortname=t.shortname,
        employer_type=t.employer_type,
    )


def _split_fio(fio: str) -> Tuple[str, str, str]:
    parts = (fio or "").strip().split()
    last = parts[0] if len(parts) > 0 else ""
    first = parts[1] if len(parts) > 1 else ""
    middle = parts[2] if len(parts) > 2 else ""
    return last, first, middle


@router.post(
    "/import_teachers/",
    summary="Импорт преподавателей из Excel",
    response={201: dict, 400: dict},
)
@transaction.atomic
def import_teachers(request):
    try:
        upload = request.FILES.get("file")
        if not upload:
            raise HttpError(400, "Не передан файл (поле 'file').")

        employer_type = request.POST.get("employer_type", "Совместитель")
        emplo = _norm_employer(employer_type)

        try:
            df = pd.read_excel(upload)
        except Exception as e:
            raise HttpError(400, f"Не удалось прочитать Excel: {e}")

        columns = {str(c).strip().lower(): c for c in df.columns}
        has_fio = "фио" in columns
        has_split = {"фамилия", "имя"} <= set(columns.keys())
        subj_col = columns.get("название предмета")
        if not subj_col or not (has_fio or has_split):
            raise HttpError(
                400,
                "Ожидаются колонки: «Название предмета» и (либо «ФИО», либо «Фамилия/Имя[/Отчество]»).",
            )

        created_teachers = 0
        created_subjects = 0
        linked_profiles = 0
        rows = []

        for _, r in df.iterrows():
            subject_name = ""
            raw_subject = r.get(subj_col)
            if raw_subject is not None and not pd.isna(raw_subject):
                subject_name = str(raw_subject).strip()

            if has_fio:
                raw_fio = r.get(columns["фио"])
                fio = (
                    "" if raw_fio is None or pd.isna(raw_fio) else str(raw_fio)
                )
                surname, name, lastname = _split_fio(fio)
            else:
                surname = str(r.get(columns["фамилия"]) or "").strip()
                name = str(r.get(columns["имя"]) or "").strip()
                lastname = str(
                    r.get(columns.get("отчество"), "") or ""
                ).strip()

            if not (surname and name):
                continue

            rows.append((surname, name, lastname, subject_name))

        for surname, name, lastname, subject_name in rows:
            t, was_created = Teacher.objects.get_or_create(
                surname=surname,
                name=name,
                lastname=lastname,
                defaults={"employer_type": emplo, "shortname": ""},
            )
            if was_created:
                created_teachers += 1
            elif t.employer_type != emplo:
                t.employer_type = emplo
                t.save(update_fields=["employer_type"])

            if subject_name:
                subj, subj_created = Subject.objects.get_or_create(
                    name=subject_name
                )
                if subj_created:
                    created_subjects += 1
                _, link_created = TeacherProfile.objects.get_or_create(
                    teacher=t, subject=subj
                )
                if link_created:
                    linked_profiles += 1

        return 201, {
            "ok": True,
            "message": "Импорт успешно завершён",
            "employer_type": emplo,
            "created_teachers": created_teachers,
            "created_subjects": created_subjects,
            "linked_profiles": linked_profiles,
        }
    except HttpError:
        raise
    except Exception as e:
        raise HttpError(400, f"import_teachers: {e}")


# ---------- LIST / SEARCH ----------
@router.get(
    "/",
    response=List[TeacherOut],
    summary="Список преподавателей (search= | q=, group_id=)",
)
def list_teachers(
    request,
    search: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    group_id: Optional[int] = Query(None),
):
    qs = Teacher.objects.all()

    if group_id:
        try:
            gp = GroupEducationalPlan.objects.select_related(
                "educational_plan"
            ).get(group_id=group_id)
            subj_ids = list(
                EducationalPlanEntry.objects.filter(
                    educational_plan=gp.educational_plan
                ).values_list("subject_id", flat=True)
            )
            qs = qs.filter(profiles__subject_id__in=subj_ids).distinct()
        except GroupEducationalPlan.DoesNotExist:
            qs = Teacher.objects.none()

    term = (search or q or "").strip()
    if term:
        qs = qs.filter(
            Q(surname__icontains=term)
            | Q(name__icontains=term)
            | Q(lastname__icontains=term)
            | Q(shortname__icontains=term)
        )

    return [_row(t) for t in qs.order_by("surname", "name")]


@router.get("/search", response=List[TeacherOut], summary="Поиск (alias)")
def search_teachers(
    request, q: str = Query(...), group_id: Optional[int] = Query(None)
):
    return list_teachers(request, q=q, group_id=group_id)


# ---------- CRUD ----------
@router.get("/{tid}/", response=TeacherOut, summary="Детально по id")
def retrieve_teacher(request, tid: int):
    t = Teacher.objects.filter(id=tid).first()
    if not t:
        raise HttpError(404, "Преподаватель не найден")
    return _row(t)


@router.post("/", response=TeacherOut, summary="Создать")
@transaction.atomic
def create_teacher(request, payload: dict = Body(...)):
    try:
        surname = (payload.get("surname") or "").strip()
        name = (payload.get("name") or "").strip()
        lastname = (payload.get("lastname") or "").strip()
        shortname = (payload.get("shortname") or "").strip()
        employer_type = _norm_employer(payload.get("employer_type"))

        if not (surname and name and lastname):
            raise HttpError(400, "Фамилия, Имя и Отчество — обязательны")

        t = Teacher.objects.create(
            surname=surname,
            name=name,
            lastname=lastname,
            shortname=shortname,
            employer_type=employer_type,
        )
        return _row(t)
    except HttpError:
        raise
    except Exception as e:
        raise HttpError(400, f"create_teacher: {e}")


@router.put("/{tid}/", response=TeacherOut, summary="Обновить")
@transaction.atomic
def update_teacher(request, tid: int, payload: dict = Body(...)):
    try:
        t = Teacher.objects.filter(id=tid).first()
        if not t:
            raise HttpError(404, "Преподаватель не найден")

        surname = (payload.get("surname") or "").strip()
        name = (payload.get("name") or "").strip()
        lastname = (payload.get("lastname") or "").strip()
        shortname = (payload.get("shortname") or "").strip()
        employer_type = payload.get("employer_type")

        if not (surname and name and lastname):
            raise HttpError(400, "Фамилия, Имя и Отчество — обязательны")

        t.surname = surname
        t.name = name
        t.lastname = lastname
        t.shortname = shortname
        if employer_type is not None:
            t.employer_type = _norm_employer(employer_type)
        t.save()

        return _row(t)
    except HttpError:
        raise
    except Exception as e:
        raise HttpError(400, f"update_teacher: {e}")


@router.delete(
    "/{teacher_id}/",
    summary="Удалить преподавателя",
    response={204: None, 404: Message, 409: Message},
)
def delete_teacher(request, teacher_id: int):
    # todo перепроверить чте за фигня тут с удалением
    teacher = get_object_or_404(Teacher, id=teacher_id)
    try:
        teacher.delete()
    except (models.ProtectedError, models.RestrictedError):
        raise HttpError(
            409,
            "Нельзя удалить преподавателя: есть связанные записи (профили/расписание и т.п.).",
        )
    return 204, None
