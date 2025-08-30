# teacher/api/extras_router.py
from __future__ import annotations
from typing import List, Optional
from ninja import Router, Query, Body, Schema
from ninja.errors import HttpError
from django.db import transaction

from teacher.models import Teacher, TeacherUnavailableDates
from teacher_profile.models import TeacherProfile
from subject.models import Subject

router = Router(tags=["Teachers-Extras"])

# ---------- Schemas ----------


class DatesIn(Schema):
    teacher_id: int
    dates: List[str]


class DatesOut(Schema):
    id: int
    teacher: int
    teacher_name: str
    dates: List[str]


class ProfileIn(Schema):
    teacher: int
    subject: int


class ProfileOut(Schema):
    id: int
    teacher: int
    teacher_name: str
    subject: int
    subject_name: str


try:
    DatesIn.model_rebuild()
    DatesOut.model_rebuild()
    ProfileIn.model_rebuild()
    ProfileOut.model_rebuild()
except Exception:
    pass


# ---------- TeacherUnavailableDates ----------
@router.get("/teacher_unavailable_dates/", response=List[DatesOut])
def list_dates(request, teacher_id: Optional[int] = Query(None)):
    qs = TeacherUnavailableDates.objects.select_related("teacher")
    if teacher_id:
        qs = qs.filter(teacher_id=teacher_id)
    out: List[DatesOut] = []
    for it in qs:
        out.append(
            DatesOut(
                id=it.id,
                teacher=it.teacher_id,
                teacher_name=it.teacher.shortname,
                dates=list(it.dates or []),
            )
        )
    return out


@router.post("/teacher_unavailable_dates/", response=DatesOut)
@transaction.atomic
def create_dates(request, payload: DatesIn = Body(...)):
    t = Teacher.objects.filter(id=payload.teacher_id).first()
    if not t:
        raise HttpError(400, "Invalid teacher_id")
    obj, _ = TeacherUnavailableDates.objects.get_or_create(teacher=t)
    obj.dates = list(payload.dates or [])
    obj.save(update_fields=["dates"])
    return DatesOut(
        id=obj.id, teacher=t.id, teacher_name=t.shortname, dates=obj.dates
    )


@router.put("/teacher_unavailable_dates/{pk}/", response=DatesOut)
@transaction.atomic
def update_dates(request, pk: int, payload: DatesIn = Body(...)):
    obj = (
        TeacherUnavailableDates.objects.select_related("teacher")
        .filter(id=pk)
        .first()
    )
    if not obj:
        raise HttpError(404, "Not found")
    if obj.teacher_id != payload.teacher_id:
        t = Teacher.objects.filter(id=payload.teacher_id).first()
        if not t:
            raise HttpError(400, "Invalid teacher_id")
        obj.teacher = t
    obj.dates = list(payload.dates or [])
    obj.save()
    return DatesOut(
        id=obj.id,
        teacher=obj.teacher_id,
        teacher_name=obj.teacher.shortname,
        dates=obj.dates,
    )


# ---------- TeacherProfile ----------
@router.get("/teacher_profiles/", response=List[ProfileOut])
def list_profiles(request):
    qs = TeacherProfile.objects.select_related("teacher", "subject").all()
    return [
        ProfileOut(
            id=p.id,
            teacher=p.teacher_id,
            teacher_name=p.teacher.shortname,
            subject=p.subject_id,
            subject_name=p.subject.name,
        )
        for p in qs
    ]


@router.post("/teacher_profiles/", response=ProfileOut)
@transaction.atomic
def create_profile(request, payload: ProfileIn = Body(...)):
    t = Teacher.objects.filter(id=payload.teacher).first()
    s = Subject.objects.filter(id=payload.subject).first()
    if not t or not s:
        raise HttpError(400, "Invalid teacher or subject")
    obj, _ = TeacherProfile.objects.get_or_create(teacher=t, subject=s)
    return ProfileOut(
        id=obj.id,
        teacher=t.id,
        teacher_name=t.shortname,
        subject=s.id,
        subject_name=s.name,
    )


@router.delete("/teacher_profiles/{pk}/", response={200: dict})
@transaction.atomic
def delete_profile(request, pk: int):
    deleted, _ = TeacherProfile.objects.filter(id=pk).delete()
    return {"detail": "deleted" if deleted else "not found"}
