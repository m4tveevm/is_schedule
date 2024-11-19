from django_filters.rest_framework import DjangoFilterBackend

from groups.models import Group

from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from teachers.models import Teacher

from .models import Lecture, ScheduleDate
from .serializers import LectureSerializer, ScheduleDateSerializer


class ScheduleDateViewSet(viewsets.ModelViewSet):
    queryset = ScheduleDate.objects.all()
    serializer_class = ScheduleDateSerializer


class LectureViewSet(viewsets.ModelViewSet):
    queryset = Lecture.objects.all()
    serializer_class = LectureSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["group", "teacher"]

    def create(self, request, *args, **kwargs):
        data = request.data

        # Получаем или создаем ScheduleDate
        date_str = data.get("schedule_date", {}).get("date")
        if not date_str:
            raise ValidationError({"schedule_date": "Date is required."})
        schedule_date, _ = ScheduleDate.objects.get_or_create(date=date_str)

        # Получаем другие поля
        time_slot = data.get("time_slot")
        brigade_number = data.get("brigade_number")
        teacher_id = data.get("teacher", {}).get("id")
        group_id = data.get("group", {}).get("id")

        # Проверка наличия обязательных полей
        if not time_slot:
            raise ValidationError({"time_slot": "Time slot is required."})
        if not brigade_number:
            raise ValidationError(
                {"brigade_number": "Brigade number is required."}
            )
        if not teacher_id:
            raise ValidationError({"teacher": "Teacher ID is required."})
        if not group_id:
            raise ValidationError({"group": "Group ID is required."})

        # Получаем объекты
        try:
            teacher = Teacher.objects.get(id=teacher_id)
            group = Group.objects.get(id=group_id)
        except (Teacher.DoesNotExist, Group.DoesNotExist) as e:
            raise ValidationError({"detail": str(e)})

        # Проверка коллизий

        # 1. Преподаватель уже назначен на это время
        if Lecture.objects.filter(
            teacher=teacher,
            schedule_date=schedule_date,
            time_slot=time_slot,
        ).exists():
            raise ValidationError(
                {
                    "teacher": f"Преподаватель {teacher.name} уже назначен на"
                    f" {schedule_date.date} ({time_slot})."
                }
            )

        # 2. Бригада группы уже имеет занятие на это время
        if Lecture.objects.filter(
            group=group,
            brigade_number=brigade_number,
            schedule_date=schedule_date,
            time_slot=time_slot,
        ).exists():
            raise ValidationError(
                {
                    "brigade_number": f"Бригада {brigade_number} группы "
                    f"{group.name} уже имеет занятие на "
                    f"{schedule_date.date} ({time_slot})."
                }
            )

        # 3. Группа уже имеет занятие в другое время на эту дату
        if (
            Lecture.objects.filter(group=group, schedule_date=schedule_date)
            .exclude(time_slot=time_slot)
            .exists()
        ):
            raise ValidationError(
                {
                    "group": f"Группа {group.name} уже имеет занятие в "
                    f"другое время на {schedule_date.date}."
                }
            )

        # Создаём лекцию
        lecture = Lecture.objects.create(
            schedule_date=schedule_date,
            time_slot=time_slot,
            group=group,
            brigade_number=brigade_number,
            teacher=teacher,
        )

        serializer = LectureSerializer(lecture)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
