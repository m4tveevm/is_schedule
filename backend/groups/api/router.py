from typing import List, Optional
from ninja import Router, Query, Body
from ninja.errors import HttpError
from django.db import transaction
from django.db.models import Q

from groups.models import Group, GroupAvailableDates
from ..transport.schemas import (
    GroupIn,
    GroupOut,
    GroupDatesIn,
    GroupDatesOut,
)

router = Router(tags=["Groups"])


# ---------- helpers ----------
def _group_row(g: Group) -> GroupOut:
    return GroupOut(id=g.id, name=g.name)


def _dates_row(gad: GroupAvailableDates) -> GroupDatesOut:
    return GroupDatesOut(
        id=gad.id,
        group_id=gad.group_id,
        group_name=gad.group.name,
        dates=gad.dates or [],
    )


# ---------- /api/groups/ ----------
@router.get(
    "/",
    response=List[GroupOut],
    summary="Список групп (search совместим с DRF)",
)
def list_groups(request, search: Optional[str] = Query(None)):
    qs = Group.objects.all().order_by("name")
    s = (search or "").strip()
    if s:
        qs = qs.filter(Q(name__icontains=s))
    return [_group_row(g) for g in qs]


@router.post("/", response=GroupOut, summary="Создать группу")
@transaction.atomic
def create_group(request, payload: GroupIn = Body(...)):
    name = (payload.name or "").strip()
    if not name:
        raise HttpError(400, "Название группы не может быть пустым")
    g = Group.objects.create(name=name)
    return _group_row(g)


@router.put("/{group_id}", response=GroupOut, summary="Обновить группу")
@transaction.atomic
def update_group(request, group_id: int, payload: GroupIn = Body(...)):
    g = Group.objects.filter(id=group_id).first()
    if not g:
        raise HttpError(404, "Группа не найдена")
    name = (payload.name or "").strip()
    if not name:
        raise HttpError(400, "Название группы не может быть пустым")
    g.name = name
    g.save(update_fields=["name"])
    return _group_row(g)


@router.delete(
    "/{group_id}", summary="Удалить группу", response={200: dict, 404: dict}
)
@transaction.atomic
def delete_group(request, group_id: int):
    deleted, _ = Group.objects.filter(id=group_id).delete()
    if not deleted:
        return {"detail": "not found"}
    return {"detail": "deleted"}


# ---------- /api/groups/available_dates ----------
@router.get(
    "/available_dates",
    response=GroupDatesOut,
    summary="Доступные даты по группе (query: group_id)",
)
def group_available_dates(request, group_id: int = Query(...)):
    gad = (
        GroupAvailableDates.objects.select_related("group")
        .filter(group_id=group_id)
        .first()
    )
    if gad:
        return _dates_row(gad)
    g = Group.objects.filter(id=group_id).first()
    if not g:
        raise HttpError(404, "Группа не найдена")
    return GroupDatesOut(id=None, group_id=g.id, group_name=g.name, dates=[])


@router.post(
    "/available_dates",
    response=GroupDatesOut,
    summary="Создать/обновить доступные даты (апсерт)",
)
@transaction.atomic
def upsert_group_available_dates(request, payload: GroupDatesIn = Body(...)):
    g = Group.objects.filter(id=payload.group_id).first()
    if not g:
        raise HttpError(404, "Группа не найдена")
    gad, _ = GroupAvailableDates.objects.get_or_create(group=g)
    gad.dates = payload.dates or []
    gad.save(update_fields=["dates"])
    return _dates_row(gad)


# ---------- Совместимость со старой ручкой /groups/{id}/available_dates ----------
@router.get(
    "/{group_id}/available_dates",
    response=GroupDatesOut,
    summary="Совместимость: даты по группе",
)
def group_available_dates_compat(request, group_id: int):
    gad = (
        GroupAvailableDates.objects.select_related("group")
        .filter(group_id=group_id)
        .first()
    )
    if gad:
        return _dates_row(gad)
    g = Group.objects.filter(id=group_id).first()
    if not g:
        raise HttpError(404, "Группа не найдена")
    return GroupDatesOut(id=None, group_id=g.id, group_name=g.name, dates=[])
