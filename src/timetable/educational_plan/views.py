from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import EducationalPlan
from .serializers import (
    EducationalPlanEntrySerializer,
    EducationalPlanSerializer,
)


class EducationalPlanViewSet(viewsets.ModelViewSet):
    queryset = EducationalPlan.objects.all()
    serializer_class = EducationalPlanSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]

    @action(detail=True, methods=["get"])
    def entries(self, request, pk=None):
        educational_plan = self.get_object()
        entries = educational_plan.entries.all()
        serializer = EducationalPlanEntrySerializer(entries, many=True)
        return Response(serializer.data)
