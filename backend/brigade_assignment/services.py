from __future__ import annotations
from typing import Iterable, List, Dict, Optional
from django.db import transaction
from django.shortcuts import get_object_or_404
from ninja.errors import HttpError
from educational_plan.models import EducationalPlanEntry
from group_educational_plan.models import GroupEducationalPlan
from teacher.models import Teacher
from .models import BrigadeAssignment
from django.db.models import Q


ALLOWED_BRIGADES = {1, 2, 3}


def _ensure_brigade_range(items: Iterable[Dict]) -> None:
    seen = set()
    for it in items:
        bn = int(it.get("brigade_number", 0))
        if bn not in ALLOWED_BRIGADES:
            raise HttpError(400, f"Недопустимый номер бригады: {bn}")
        if bn in seen:
            raise HttpError(400, f"Дубликат бригады: {bn}")
        seen.add(bn)


def _denorm_row(a: BrigadeAssignment) -> Dict:
    return {
        "id": a.id,
        "composite_id": f"{a.group_educational_plan_id}-{a.educational_plan_entry_id}-{a.brigade_number}",
        "group_educational_plan": a.group_educational_plan_id,
        "educational_plan_entry": a.educational_plan_entry_id,
        "group_name": a.group_educational_plan.group.name,
        "educational_plan_name": a.group_educational_plan.educational_plan.name,
        "subject_name": a.educational_plan_entry.subject.name,
        "lesson_type_name": a.educational_plan_entry.lesson_type,
        "brigade_number": a.brigade_number,
        "teacher": a.teacher_id,
        "teacher_name": getattr(a.teacher, "shortname", None),
    }


def get_bulk(group_plan_id: int, entry_id: int) -> List[BrigadeAssignment]:
    group_plan = get_object_or_404(GroupEducationalPlan, id=group_plan_id)
    plan_entry = get_object_or_404(EducationalPlanEntry, id=entry_id)
    return list(
        BrigadeAssignment.objects.select_related(
            "group_educational_plan__group",
            "group_educational_plan__educational_plan",
            "educational_plan_entry__subject",
            "teacher",
        ).filter(
            group_educational_plan=group_plan,
            educational_plan_entry=plan_entry,
        )
    )


@transaction.atomic
def upsert_bulk(
    group_plan_id: int, entry_id: int, brigades: List[Dict]
) -> List[BrigadeAssignment]:
    _ensure_brigade_range(brigades)
    group_plan = get_object_or_404(GroupEducationalPlan, id=group_plan_id)
    plan_entry = get_object_or_404(EducationalPlanEntry, id=entry_id)

    requested: Dict[int, Optional[int]] = {
        int(i["brigade_number"]): (i.get("teacher") or None) for i in brigades
    }
    existing = list(
        BrigadeAssignment.objects.filter(
            group_educational_plan=group_plan,
            educational_plan_entry=plan_entry,
        )
    )

    to_delete_ids, to_update, to_create = [], [], []
    for a in existing:
        bn = a.brigade_number
        teacher_id = requested.get(bn)
        if not teacher_id:
            to_delete_ids.append(a.id)
        else:
            if a.teacher_id != teacher_id:
                teacher = Teacher.objects.filter(id=teacher_id).first()
                if not teacher:
                    raise HttpError(400, f"Invalid teacher ID: {teacher_id}")
                a.teacher = teacher
                to_update.append(a)
            requested.pop(bn, None)

    if to_delete_ids:
        BrigadeAssignment.objects.filter(id__in=to_delete_ids).delete()
    if to_update:
        BrigadeAssignment.objects.bulk_update(to_update, ["teacher"])

    for bn, tid in requested.items():
        if not tid:
            continue
        teacher = Teacher.objects.filter(id=tid).first()
        if not teacher:
            raise HttpError(400, f"Invalid teacher ID: {tid}")
        to_create.append(
            BrigadeAssignment(
                group_educational_plan=group_plan,
                educational_plan_entry=plan_entry,
                brigade_number=bn,
                teacher=teacher,
            )
        )
    if to_create:
        BrigadeAssignment.objects.bulk_create(to_create, ignore_conflicts=True)

    return get_bulk(group_plan_id, entry_id)


@transaction.atomic
def delete_bulk(group_plan_id: int, entry_id: int) -> int:
    qs = BrigadeAssignment.objects.filter(
        group_educational_plan_id=group_plan_id,
        educational_plan_entry_id=entry_id,
    )
    count = qs.count()
    qs.delete()
    return count


def list_all(search: Optional[str]) -> List[Dict]:
    qs = BrigadeAssignment.objects.select_related(
        "group_educational_plan__group",
        "group_educational_plan__educational_plan",
        "educational_plan_entry__subject",
        "teacher",
    )
    if search:
        s = search.strip()
        qs = qs.filter(
            Q(group_educational_plan__group__name__icontains=s)
            | Q(group_educational_plan__educational_plan__name__icontains=s)
            | Q(educational_plan_entry__subject__name__icontains=s)
            | Q(teacher__surname__icontains=s)
            | Q(teacher__shortname__icontains=s)
        )
    return [_denorm_row(a) for a in qs]


class BrigadeAssignmentService:
    @staticmethod
    def get_bulk(group_plan_id, entry_id):
        group_plan = get_object_or_404(GroupEducationalPlan, id=group_plan_id)
        plan_entry = get_object_or_404(EducationalPlanEntry, id=entry_id)
        return BrigadeAssignment.objects.filter(
            group_educational_plan=group_plan,
            educational_plan_entry=plan_entry,
        )

    @staticmethod
    def create_bulk(group_plan, plan_entry, brigades):
        objects = []
        for item in brigades:
            bn = item["brigade_number"]
            teacher_id = item.get("teacher")
            if not teacher_id:
                continue
            teacher = Teacher.objects.filter(id=teacher_id).first()
            if not teacher:
                raise HttpError(400, f"Invalid teacher ID: {teacher_id}")
            objects.append(
                BrigadeAssignment(
                    group_educational_plan=group_plan,
                    educational_plan_entry=plan_entry,
                    brigade_number=bn,
                    teacher=teacher,
                )
            )
        return BrigadeAssignment.objects.bulk_create(objects)

    @staticmethod
    def update_bulk(group_plan, plan_entry, brigades):
        requested = {
            item["brigade_number"]: item.get("teacher") for item in brigades
        }
        existing = list(
            BrigadeAssignment.objects.filter(
                group_educational_plan=group_plan,
                educational_plan_entry=plan_entry,
            )
        )

        to_delete = []
        to_update = []
        for assignment in existing:
            bn = assignment.brigade_number
            teacher_id = requested.get(bn)
            if not teacher_id:
                to_delete.append(assignment.id)
            else:
                if assignment.teacher_id != teacher_id:
                    teacher = Teacher.objects.filter(id=teacher_id).first()
                    if not teacher:
                        raise HttpError(
                            400, f"Invalid teacher ID: {teacher_id}"
                        )
                    assignment.teacher = teacher
                    to_update.append(assignment)
                requested.pop(bn)

        if to_delete:
            BrigadeAssignment.objects.filter(id__in=to_delete).delete()
        if to_update:
            BrigadeAssignment.objects.bulk_update(to_update, ["teacher"])

        new_objs = []
        for bn, teacher_id in requested.items():
            if not teacher_id:
                continue
            teacher = Teacher.objects.filter(id=teacher_id).first()
            if not teacher:
                raise HttpError(400, f"Invalid teacher ID: {teacher_id}")
            new_objs.append(
                BrigadeAssignment(
                    group_educational_plan=group_plan,
                    educational_plan_entry=plan_entry,
                    brigade_number=bn,
                    teacher=teacher,
                )
            )
        if new_objs:
            BrigadeAssignment.objects.bulk_create(new_objs)

        return BrigadeAssignment.objects.filter(
            group_educational_plan=group_plan,
            educational_plan_entry=plan_entry,
        )

    @staticmethod
    def delete_bulk(group_plan_id, entry_id):
        qs = BrigadeAssignmentService.get_bulk(group_plan_id, entry_id)
        count = qs.count()
        qs.delete()
        return count
