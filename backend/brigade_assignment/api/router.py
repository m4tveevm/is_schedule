from typing import List, Optional
from ninja import Router, Query
from django.db.models import Q

from brigade_assignment.models import BrigadeAssignment
from brigade_assignment.services import BrigadeAssignmentService
from brigade_assignment.transport.schemas import (
    BrigadeBulkIn,
    BrigadeRowOut,
    OkOut,
)

router = Router(tags=["Brigades"])

SELECT = (
    "group_educational_plan__group",
    "group_educational_plan__educational_plan",
    "educational_plan_entry__subject",
    "educational_plan_entry__lesson_type",
    "teacher",
)


def _row(a: BrigadeAssignment) -> BrigadeRowOut:
    return BrigadeRowOut(
        id=a.id,
        composite_id=f"{a.group_educational_plan_id}-{a.educational_plan_entry_id}-{a.brigade_number}",
        group_educational_plan=a.group_educational_plan_id,
        educational_plan_entry=a.educational_plan_entry_id,
        group_name=a.group_educational_plan.group.name,
        educational_plan_name=a.group_educational_plan.educational_plan.name,
        subject_name=a.educational_plan_entry.subject.name,
        lesson_type_name=getattr(
            a.educational_plan_entry.lesson_type,
            "short_name",
            a.educational_plan_entry.lesson_type,
        ),
        brigade_number=a.brigade_number,
        teacher=a.teacher_id,
        teacher_name=getattr(a.teacher, "shortname", None),
    )


@router.get(
    "/", response=List[BrigadeRowOut], summary="Список назначений (поиск q)"
)
def list_assignments(request, q: Optional[str] = Query(None)):
    qs = BrigadeAssignment.objects.select_related(*SELECT)
    if q:
        qs = qs.filter(
            Q(group_educational_plan__group__name__icontains=q)
            | Q(group_educational_plan__educational_plan__name__icontains=q)
            | Q(educational_plan_entry__subject__name__icontains=q)
            | Q(teacher__surname__icontains=q)
            | Q(teacher__shortname__icontains=q)
        )
    return [
        _row(a)
        for a in qs.order_by(
            "group_educational_plan_id",
            "educational_plan_entry_id",
            "brigade_number",
        )
    ]


@router.post(
    "/",
    response=List[BrigadeRowOut],
    summary="Создать/обновить назначения (bulk upsert) — совместимо с фронтом",
)
def bulk_update(request, payload: BrigadeBulkIn):
    gp_id = payload.group_educational_plan
    ep_id = payload.educational_plan_entry
    # upsert: использовать существующий сервис update_bulk
    assignments = BrigadeAssignmentService.update_bulk(  # noqa: F841
        group_plan=payload.group_educational_plan,
        plan_entry=payload.educational_plan_entry,
        brigades=[b.model_dump() for b in payload.brigades],
    )
    qs = BrigadeAssignment.objects.select_related(*SELECT).filter(
        group_educational_plan_id=gp_id, educational_plan_entry_id=ep_id
    )
    return [_row(a) for a in qs]


@router.get(
    "/bulk",
    response=List[BrigadeRowOut],
    summary="Получить назначения для GEP + Entry",
)
def bulk_get(
    request, group_educational_plan: int, educational_plan_entry: int
):
    qs = BrigadeAssignmentService.get_bulk(
        group_educational_plan, educational_plan_entry
    ).select_related(*SELECT)
    return [_row(a) for a in qs]


@router.post(
    "/bulk_update",
    response=List[BrigadeRowOut],
    summary="Alias для совместимости",
)
def bulk_update_alias(request, payload: BrigadeBulkIn):
    return bulk_update(request, payload)


@router.post(
    "/bulk_delete",
    response=OkOut,
    summary="Удалить все назначения по GEP + Entry",
)
def bulk_delete(request, payload: BrigadeBulkIn):
    deleted = BrigadeAssignmentService.delete_bulk(
        payload.group_educational_plan, payload.educational_plan_entry
    )
    return OkOut(ok=True, message=f"Deleted {deleted} assignments")
