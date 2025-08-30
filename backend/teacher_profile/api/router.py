from typing import List, Optional
from ninja import Router, Body, Query
from django.db import transaction

from ..models import TeacherProfile
from ..transport.schemas import TeacherProfileIn, TeacherProfileOut

router = Router(tags=["TeacherProfiles"])


def _row(p: TeacherProfile) -> TeacherProfileOut:
    return TeacherProfileOut(
        id=p.id,
        teacher=p.teacher_id,
        subject=p.subject_id,
        teacher_name=getattr(p.teacher, "shortname", None),
        subject_name=getattr(p.subject, "name", None),
    )


@router.get("/", response=List[TeacherProfileOut], summary="Список профилей")
def list_profiles(
    request,
    teacher: Optional[int] = Query(None),
    subject: Optional[int] = Query(None),
):
    qs = TeacherProfile.objects.select_related("teacher", "subject").all()
    if teacher:
        qs = qs.filter(teacher_id=teacher)
    if subject:
        qs = qs.filter(subject_id=subject)
    return [_row(p) for p in qs.order_by("teacher_id", "subject_id")]


@router.post("/", response=TeacherProfileOut)
@transaction.atomic
def create_profile(request, payload: TeacherProfileIn = Body(...)):
    p = TeacherProfile.objects.create(
        teacher_id=payload.teacher, subject_id=payload.subject
    )
    return _row(p)


@router.delete("/{pid}", response={200: dict, 404: dict})
def delete_profile(request, pid: int):
    deleted, _ = TeacherProfile.objects.filter(id=pid).delete()
    return {"detail": "deleted" if deleted else "not found"}
