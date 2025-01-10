from educational_plan.models import EducationalPlanEntry

from group_educational_plan.models import GroupEducationalPlan

from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from teacher.models import Teacher

from .models import BrigadeAssignment
from .serializers import (
    BrigadeAssignmentCreateUpdateSerializer,
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
        serializer = BrigadeAssignmentCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        group_educational_plan_id = data["group_educational_plan"]
        educational_plan_entry_id = data["educational_plan_entry"]
        brigades_data = data["brigades"]

        try:
            group_educational_plan = GroupEducationalPlan.objects.get(
                id=group_educational_plan_id
            )
        except GroupEducationalPlan.DoesNotExist:
            return Response(
                {"error": "Invalid GroupEducationalPlan ID"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            educational_plan_entry = EducationalPlanEntry.objects.get(
                id=educational_plan_entry_id
            )
        except EducationalPlanEntry.DoesNotExist:
            return Response(
                {"error": "Invalid EducationalPlanEntry ID"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_assignments = []
        for brigade in brigades_data:
            brigade_number = brigade["brigade_number"]
            teacher_id = brigade["teacher"]
            if teacher_id:
                try:
                    teacher = Teacher.objects.get(id=teacher_id)
                except Teacher.DoesNotExist:
                    return Response(
                        {"error": f"Invalid Teacher ID: {teacher_id}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                assignment = BrigadeAssignment.objects.create(
                    group_educational_plan=group_educational_plan,
                    educational_plan_entry=educational_plan_entry,
                    brigade_number=brigade_number,
                    teacher=teacher,
                )
                created_assignments.append(assignment)
        read_serializer = BrigadeAssignmentSerializer(
            created_assignments, many=True
        )
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        composite_id = kwargs.get("pk")
        group_plan_id, plan_entry_id, brigade_number = composite_id.split("-")

        try:
            assignment = BrigadeAssignment.objects.get(
                group_educational_plan_id=group_plan_id,
                educational_plan_entry_id=plan_entry_id,
                brigade_number=brigade_number,
            )
        except BrigadeAssignment.DoesNotExist:
            return Response(
                {"error": "Assignment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(assignment, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        composite_id = kwargs.get("pk")
        group_plan_id, plan_entry_id, brigade_number = composite_id.split("-")
        try:
            assignment = BrigadeAssignment.objects.get(
                group_educational_plan_id=group_plan_id,
                educational_plan_entry_id=plan_entry_id,
                brigade_number=brigade_number,
            )
            assignment.delete()
        except BrigadeAssignment.DoesNotExist:
            return Response(
                {"error": "Assignment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            {"status": "Deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )

    @action(detail=False, methods=["post"])
    def bulk_update(self, request):
        data = request.data
        group_educational_plan_id = data.get("group_educational_plan")
        educational_plan_entry_id = data.get("educational_plan_entry")
        brigades_data = data.get("brigades", [])

        if not group_educational_plan_id or not educational_plan_entry_id:
            return Response(
                {
                    "error": "group_educational_plan and educational_plan_entry"
                    "are required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            group_educational_plan = GroupEducationalPlan.objects.get(
                id=group_educational_plan_id
            )
        except GroupEducationalPlan.DoesNotExist:
            return Response(
                {"error": "Invalid GroupEducationalPlan ID"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            educational_plan_entry = EducationalPlanEntry.objects.get(
                id=educational_plan_entry_id
            )
        except EducationalPlanEntry.DoesNotExist:
            return Response(
                {"error": "Invalid EducationalPlanEntry ID"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        requested_brigades = {
            b["brigade_number"]: b.get("teacher")
            for b in brigades_data
            if "brigade_number" in b
        }
        existing_assignments = BrigadeAssignment.objects.filter(
            group_educational_plan=group_educational_plan,
            educational_plan_entry=educational_plan_entry,
        )
        for assignment in existing_assignments:
            bn = assignment.brigade_number
            if bn not in requested_brigades:
                assignment.delete()
                continue
            new_teacher_id = requested_brigades[bn]
            if new_teacher_id is None:
                assignment.delete()
            else:
                if assignment.teacher_id != new_teacher_id:
                    try:
                        teacher = Teacher.objects.get(id=new_teacher_id)
                        assignment.teacher = teacher
                        assignment.save()
                    except Teacher.DoesNotExist:
                        return Response(
                            {"error": f"Invalid Teacher ID: {new_teacher_id}"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
            requested_brigades.pop(bn, None)

        for bn, teacher_id in requested_brigades.items():
            if teacher_id is None:
                continue
            try:
                teacher = Teacher.objects.get(id=teacher_id)
                BrigadeAssignment.objects.create(
                    group_educational_plan=group_educational_plan,
                    educational_plan_entry=educational_plan_entry,
                    brigade_number=bn,
                    teacher=teacher,
                )
            except Teacher.DoesNotExist:
                return Response(
                    {"error": f"Invalid Teacher ID: {teacher_id}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        updated_assignments = BrigadeAssignment.objects.filter(
            group_educational_plan=group_educational_plan,
            educational_plan_entry=educational_plan_entry,
        )
        serializer = BrigadeAssignmentSerializer(
            updated_assignments, many=True
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
