import traceback

from educational_plan.models import EducationalPlanEntry

from group_educational_plan.models import GroupEducationalPlan

import pandas as pd

from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from subject.models import Subject

from teacher_profile.models import TeacherProfile

from .models import Teacher, TeacherUnavailableDates
from .serializers import TeacherSerializer, TeacherUnavailableDatesSerializer


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["surname", "name", "lastname", "shortname"]

    def get_queryset(self):
        qs = super().get_queryset()
        request = self.request
        group_id = request.query_params.get("group_id", None)

        if group_id:
            try:
                gp = GroupEducationalPlan.objects.select_related(
                    "educational_plan"
                ).get(group_id=group_id)
                plan_subjects = EducationalPlanEntry.objects.filter(
                    educational_plan=gp.educational_plan
                ).values_list("subject_id", flat=True)

                qs = qs.filter(
                    profiles__subject_id__in=plan_subjects
                ).distinct()
            except GroupEducationalPlan.DoesNotExist:
                return qs.none()

        return qs

    @action(detail=False, methods=["post"], parser_classes=[MultiPartParser])
    def import_teachers(self, request):
        file_obj = request.FILES.get("file")
        employer_type = request.data.get("employer_type", Teacher.CONTRIBUTOR)

        if not file_obj:
            return Response(
                {"detail": "Файл не найден."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            data = pd.read_excel(file_obj)
            data[["Фамилия", "Имя", "Отчество"]] = data["ФИО"].str.split(
                " ", expand=True, n=2
            )

            for _, row in data.iterrows():
                if pd.isna(row.get("Фамилия")) or pd.isna(row.get("Имя")):
                    continue

                teacher, created = Teacher.objects.get_or_create(
                    surname=row["Фамилия"],
                    name=row["Имя"],
                    lastname=row.get("Отчество", ""),
                    employer_type=employer_type,
                )

                subject_name = row.get("Название предмета")
                if pd.notna(subject_name):
                    subject, _ = Subject.objects.get_or_create(
                        name=subject_name
                    )
                    TeacherProfile.objects.get_or_create(
                        teacher=teacher, subject=subject
                    )

            return Response(
                {"detail": "Импорт завершен!"}, status=status.HTTP_200_OK
            )

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"detail": f"Ошибка: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class TeacherUnavailableDatesViewSet(viewsets.ModelViewSet):
    queryset = TeacherUnavailableDates.objects.all()
    serializer_class = TeacherUnavailableDatesSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        teacher_id = self.request.query_params.get("teacher_id")
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)
        return queryset
