from ninja import Router, Query
from typing import List
from ..transport.schemas import PlanEntryOut
from ..models import EducationalPlanEntry
from group_educational_plan.models import GroupEducationalPlan

router = Router(tags=["EducationalPlans"])


@router.get(
    "/entries_by_group_plan",
    response=List[PlanEntryOut],
    summary="Записи плана по GEP.id",
)
def entries_by_group_plan(request, group_educational_plan: int = Query(...)):
    gp = GroupEducationalPlan.objects.select_related("educational_plan").get(
        id=group_educational_plan
    )
    entries = (
        EducationalPlanEntry.objects.select_related("subject")
        .filter(educational_plan=gp.educational_plan)
        .order_by("subject__name", "lesson_type")
    )
    return [
        PlanEntryOut(
            id=e.id, subject_name=e.subject.name, lesson_type=e.lesson_type
        )
        for e in entries
    ]
