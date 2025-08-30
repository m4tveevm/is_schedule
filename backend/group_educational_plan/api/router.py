from ninja import Router, Query
from typing import List
from ..transport.schemas import GroupPlanSearchOut
from ..models import GroupEducationalPlan
from django.db.models import Q

router = Router(tags=["GroupPlans"])


@router.get(
    "/search",
    response=List[GroupPlanSearchOut],
    summary="Поиск GEP для подсказок",
)
def search_gep(request, q: str = Query(...)):
    s = q.strip()
    qs = (
        GroupEducationalPlan.objects.select_related(
            "group", "educational_plan"
        )
        .filter(
            Q(group__name__icontains=s)
            | Q(educational_plan__name__icontains=s)
        )
        .order_by("group__name", "educational_plan__name")[:20]
    )
    out = []
    for gp in qs:
        out.append(
            GroupPlanSearchOut(
                id=gp.id,
                group=gp.group.name,
                educational_plan=gp.educational_plan.name,
                group_name=gp.group.name,  # для старых фронтов
                educational_plan_name=gp.educational_plan.name,
            )
        )
    return out
