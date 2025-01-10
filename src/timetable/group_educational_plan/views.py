from rest_framework import filters, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import GroupEducationalPlan
from .serializers import GroupEducationalPlanSerializer


class GroupEducationalPlanViewSet(viewsets.ModelViewSet):
    queryset = GroupEducationalPlan.objects.select_related(
        "group", "educational_plan"
    ).all()
    serializer_class = GroupEducationalPlanSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["group__name", "educational_plan__name"]


@api_view(["GET"])
def group_plan_remaining(request):
    group_id = request.query_params.get("group_id")
    if not group_id:
        return Response({"error": "group_id is required"}, status=400)

    try:
        gep = GroupEducationalPlan.objects.select_related(
            "educational_plan"
        ).get(group_id=group_id)
    except GroupEducationalPlan.DoesNotExist:
        return Response(
            {"error": "No educational plan for this group"}, status=404
        )

    total = {"УП": 0, "КЛ": 0, "ДК": 0}
    for entry in gep.educational_plan.entries.all():
        lt_name = entry.lesson_type.short_name
        if lt_name in total:
            total[lt_name] += entry.hours

    return Response(total, status=200)
