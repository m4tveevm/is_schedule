from typing import List, Optional
from ninja import Router, Query, Body
from ninja.errors import HttpError
from django.db import transaction
from django.db.models import Q

from subject.models import Subject
from ..transport.schemas import SubjectIn, SubjectOut

router = Router(tags=["Subjects"])


def _row(s: Subject) -> SubjectOut:
    return SubjectOut(id=s.id, name=s.name, short_name=s.short_name or "")


@router.get(
    "/",
    response=List[SubjectOut],
    summary="Список предметов (search совместим с DRF)",
)
def list_subjects(request, search: Optional[str] = Query(None)):
    qs = Subject.objects.all().order_by("name")
    s = (search or "").strip()
    if s:
        qs = qs.filter(Q(name__icontains=s) | Q(short_name__icontains=s))
    return [_row(x) for x in qs]


@router.post("/", response=SubjectOut)
@transaction.atomic
def create_subject(request, payload: SubjectIn = Body(...)):
    name = (payload.name or "").strip()
    if not name:
        raise HttpError(400, "Название предмета не может быть пустым")
    s = Subject.objects.create(name=name, short_name=payload.short_name or "")
    return _row(s)


@router.put("/{sid}", response=SubjectOut)
@transaction.atomic
def update_subject(request, sid: int, payload: SubjectIn = Body(...)):
    s = Subject.objects.filter(id=sid).first()
    if not s:
        raise HttpError(404, "Предмет не найден")
    s.name = (payload.name or "").strip()
    s.short_name = payload.short_name or ""
    s.save(update_fields=["name", "short_name"])
    return _row(s)


@router.delete("/{sid}", response={200: dict, 404: dict})
def delete_subject(request, sid: int):
    deleted, _ = Subject.objects.filter(id=sid).delete()
    return {"detail": "deleted" if deleted else "not found"}
