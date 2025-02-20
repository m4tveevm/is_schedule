from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Group, GroupAvailableDates
from .serializers import GroupAvailableDatesSerializer, GroupSerializer


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

    @action(detail=True, methods=["get"], url_path="available_dates")
    def available_dates_action(self, request, pk=None):
        group = self.get_object()
        if hasattr(group, "available_dates"):
            return Response({"dates": group.available_dates.dates}, status=200)
        else:
            return Response({"dates": []}, status=200)


class GroupAvailableDatesViewSet(viewsets.ModelViewSet):
    queryset = GroupAvailableDates.objects.all()
    serializer_class = GroupAvailableDatesSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        group_id = self.request.query_params.get("group_id")
        if group_id:
            queryset = queryset.filter(group_id=group_id)
        return queryset
