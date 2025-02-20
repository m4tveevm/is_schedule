from educational_plan.models import EducationalPlanEntry

from group_educational_plan.models import GroupEducationalPlan

from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from teacher.models import Teacher


from .models import BrigadeAssignment
from .serializers import (
    BrigadeAssignmentBulkSerializer,
    BrigadeAssignmentSerializer,
)


class BrigadeAssignmentViewSet(viewsets.ModelViewSet):
    queryset = BrigadeAssignment.objects.select_related(
        "group_educational_plan__group",
        "group_educational_plan__educational_plan",
        "educational_plan_entry__subject",
        "teacher",
    ).all()
    serializer_class = BrigadeAssignmentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = [
        "group_educational_plan__group__name",
        "group_educational_plan__educational_plan__name",
        "educational_plan_entry__subject__name",
        "teacher__surname",
        "teacher__shortname",
    ]

    def create(self, request, *args, **kwargs):
        bulk_serializer = BrigadeAssignmentBulkSerializer(data=request.data)
        bulk_serializer.is_valid(raise_exception=True)
        data = bulk_serializer.validated_data

        group_plan = GroupEducationalPlan.objects.get(
            id=data["group_educational_plan"]
        )
        plan_entry = EducationalPlanEntry.objects.get(
            id=data["educational_plan_entry"]
        )
        brigades_data = data["brigades"]

        created = []
        for brigade in brigades_data:
            brigade_number = brigade.get("brigade_number")
            teacher_id = brigade.get("teacher")
            if not teacher_id:
                continue
            teacher = Teacher.objects.filter(id=teacher_id).first()
            if not teacher:
                return Response(
                    {"error": f"Некорректный ID преподавателя: {teacher_id}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            assignment = BrigadeAssignment.objects.create(
                group_educational_plan=group_plan,
                educational_plan_entry=plan_entry,
                brigade_number=brigade_number,
                teacher=teacher,
            )
            created.append(assignment)

        read_serializer = BrigadeAssignmentSerializer(created, many=True)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def bulk_get(self, request):
        group_plan_id = request.query_params.get("group_educational_plan")
        plan_entry_id = request.query_params.get("educational_plan_entry")
        if not group_plan_id or not plan_entry_id:
            return Response(
                {
                    "error": "Параметры group_educational_plan и "
                    "educational_plan_entry обязательны."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        assignments = BrigadeAssignment.objects.filter(
            group_educational_plan=group_plan_id,
            educational_plan_entry=plan_entry_id,
        )
        serializer = BrigadeAssignmentSerializer(assignments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"])
    def bulk_update(self, request):
        bulk_serializer = BrigadeAssignmentBulkSerializer(data=request.data)
        bulk_serializer.is_valid(raise_exception=True)
        data = bulk_serializer.validated_data

        group_plan = GroupEducationalPlan.objects.get(
            id=data["group_educational_plan"]
        )
        plan_entry = EducationalPlanEntry.objects.get(
            id=data["educational_plan_entry"]
        )
        requested_brigades = {
            item["brigade_number"]: item.get("teacher")
            for item in data["brigades"]
            if "brigade_number" in item
        }

        existing = BrigadeAssignment.objects.filter(
            group_educational_plan=group_plan,
            educational_plan_entry=plan_entry,
        )
        for assignment in existing:
            bn = assignment.brigade_number
            if bn not in requested_brigades or not requested_brigades[bn]:
                assignment.delete()
            else:
                new_teacher_id = requested_brigades[bn]
                if assignment.teacher_id != new_teacher_id:
                    teacher = Teacher.objects.filter(id=new_teacher_id).first()
                    if not teacher:
                        return Response(
                            {
                                "error": f"Некорректный ID преподавателя: "
                                f"{new_teacher_id}"
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    assignment.teacher = teacher
                    assignment.save()
            requested_brigades.pop(bn, None)

        for bn, teacher_id in requested_brigades.items():
            if teacher_id:
                teacher = Teacher.objects.filter(id=teacher_id).first()
                if not teacher:
                    return Response(
                        {
                            "error": f"Некорректный ID преподавателя: "
                            f"{teacher_id}"
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                BrigadeAssignment.objects.create(
                    group_educational_plan=group_plan,
                    educational_plan_entry=plan_entry,
                    brigade_number=bn,
                    teacher=teacher,
                )
        updated = BrigadeAssignment.objects.filter(
            group_educational_plan=group_plan,
            educational_plan_entry=plan_entry,
        )
        serializer = BrigadeAssignmentSerializer(updated, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"])
    def bulk_delete(self, request):
        group_plan_id = request.data.get("group_educational_plan")
        plan_entry_id = request.data.get("educational_plan_entry")
        if not group_plan_id or not plan_entry_id:
            return Response(
                {
                    "error": "Параметры group_educational_plan и "
                    "educational_plan_entry обязательны."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        assignments = BrigadeAssignment.objects.filter(
            group_educational_plan=group_plan_id,
            educational_plan_entry=plan_entry_id,
        )
        count = assignments.count()
        assignments.delete()
        return Response(
            {"status": f"Удалено {count} назначений"},
            status=status.HTTP_200_OK,
        )
