from groups.serializers import GroupSerializer

from rest_framework import serializers

from teachers.serializers import TeacherSerializer

from .models import Lecture, ScheduleDate


class ScheduleDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduleDate
        fields = ["id", "date"]


class LectureSerializer(serializers.ModelSerializer):
    group = GroupSerializer()
    teacher = TeacherSerializer()
    schedule_date = ScheduleDateSerializer()

    class Meta:
        model = Lecture
        fields = [
            "id",
            "time_slot",
            "brigade_number",
            "schedule_date",
            "group",
            "teacher",
        ]

    def validate(self, data):
        teacher = data.get("teacher")
        schedule_date = data.get("schedule_date")
        time_slot = data.get("time_slot")
        group = data.get("group")
        brigade_number = data.get("brigade_number")

        # 1. Проверка занятости преподавателя
        if (
            Lecture.objects.filter(
                teacher=teacher,
                schedule_date=schedule_date,
                time_slot=time_slot,
            )
            .exclude(id=self.instance.id if self.instance else None)
            .exists()
        ):
            raise serializers.ValidationError(
                {
                    "teacher": (
                        f"Преподаватель {teacher.name} уже назначен на "
                        f"{schedule_date.date} ({time_slot})."
                    )
                }
            )

        # 2. Проверка занятости бригады
        if (
            Lecture.objects.filter(
                group=group,
                brigade_number=brigade_number,
                schedule_date=schedule_date,
                time_slot=time_slot,
            )
            .exclude(id=self.instance.id if self.instance else None)
            .exists()
        ):
            raise serializers.ValidationError(
                {
                    "brigade_number": (
                        f"Бригада {brigade_number} группы {group.name} уже "
                        f"имеет занятие на {schedule_date.date} ({time_slot})."
                    )
                }
            )

        # 3. Проверка наличия занятия в другое время
        if (
            Lecture.objects.filter(
                group=group,
                schedule_date=schedule_date,
            )
            .exclude(id=self.instance.id if self.instance else None)
            .exclude(time_slot=time_slot)
            .exists()
        ):
            raise serializers.ValidationError(
                {
                    "time_slot": (
                        f"Группа {group.name} уже имеет занятие в другое "
                        f"время на {schedule_date.date}."
                    )
                }
            )

        return data
