from django.db import models

from .utils import generate_time_slots
from django.core.exceptions import ValidationError


class Group(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Teacher(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


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
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    groups = models.ManyToManyField(Group)

    def __str__(self):
        group_names = ", ".join(group.name for group in self.groups.all())
        return f"{self.teacher.name} - {self.schedule_date.date} ({self.get_time_slot_display()}) для групп [{group_names}]"

    def clean(self):
        if Lecture.objects.filter(
                teacher=self.teacher,
                schedule_date=self.schedule_date,
                time_slot=self.time_slot,
        ).exclude(id=self.id).exists():
            raise ValidationError({
                'teacher': f"Преподаватель {self.teacher.name} уже назначен на {self.schedule_date.date} ({self.get_time_slot_display()})"
            })


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
