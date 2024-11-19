from django.core.exceptions import ValidationError
from django.db import models

from groups.models import Group

from teachers.models import Teacher


class ScheduleDate(models.Model):
    date = models.DateField(unique=True)

    def __str__(self):
        return self.date.strftime("%d.%m.%Y")


class Lecture(models.Model):
    schedule_date = models.ForeignKey(
        ScheduleDate, on_delete=models.CASCADE, related_name="lectures"
    )
    TIME_SLOT_CHOICES = (
        ("morning", "Утро"),
        ("evening", "Вечер"),
    )
    time_slot = models.CharField(
        max_length=10,
        choices=TIME_SLOT_CHOICES,
    )
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    brigade_number = models.PositiveSmallIntegerField(
        choices=[(1, "Бригада 1"), (2, "Бригада 2"), (3, "Бригада 3")]
    )
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)

    def __str__(self):
        return (
            f"{self.teacher.name} - {self.schedule_date.date} "
            f"({self.get_time_slot_display()}) для группы "
            f"{self.group.name}, бригада {self.brigade_number}"
        )

    def clean(self):
        if (
            Lecture.objects.filter(
                teacher=self.teacher,
                schedule_date=self.schedule_date,
                time_slot=self.time_slot,
            )
            .exclude(id=self.id)
            .exists()
        ):
            raise ValidationError(
                {
                    "teacher": f"Преподаватель {self.teacher.name} "
                    f"уже назначен на {self.schedule_date.date} "
                    f"({self.get_time_slot_display()})"
                }
            )
        if (
            Lecture.objects.filter(
                group=self.group,
                brigade_number=self.brigade_number,
                schedule_date=self.schedule_date,
                time_slot=self.time_slot,
            )
            .exclude(id=self.id)
            .exists()
        ):
            raise ValidationError(
                {
                    "brigade_number": f"Бригада {self.brigade_number} "
                    f"группы {self.group.name} уже имеет "
                    f"занятие на {self.schedule_date.date} "
                    f"({self.get_time_slot_display()})"
                }
            )
        if (
            Lecture.objects.filter(
                group=self.group,
                schedule_date=self.schedule_date,
            )
            .exclude(id=self.id)
            .exclude(time_slot=self.time_slot)
            .exists()
        ):
            raise ValidationError(
                {
                    "time_slot": f"Группа {self.group.name} уже "
                    f"имеет занятие в другое время на "
                    f"{self.schedule_date.date}"
                }
            )

    def get_start_time(self):
        if self.time_slot == "morning":
            return "9:30"
        elif self.time_slot == "evening":
            return "13:30"

    def get_end_time(self):
        if self.time_slot == "morning":
            return "12:30"
        elif self.time_slot == "evening":
            return "16:30"
