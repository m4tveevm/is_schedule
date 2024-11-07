from django.db import models

from .utils import generate_time_slots


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
    number_of_lectures = models.PositiveSmallIntegerField(default=3)

    def __str__(self):
        return self.date.strftime('%d.%m.%Y')

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Удаляем существующие временные слоты
        self.time_slots.all().delete()
        # Генерируем новые временные слоты
        slots = generate_time_slots(self)
        for slot in slots:
            TimeSlot.objects.create(
                schedule_date=self,
                slot_number=slot['slot_number'],
                start_time=slot['start_time'],
                end_time=slot['end_time'],
            )


class TimeSlot(models.Model):
    schedule_date = models.ForeignKey(ScheduleDate, on_delete=models.CASCADE,
                                      related_name='time_slots')
    slot_number = models.PositiveSmallIntegerField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ('schedule_date', 'slot_number')

    def __str__(self):
        return f"{self.schedule_date.date} - Слот {self.slot_number}"


class Lecture(models.Model):
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE,
                                  related_name='lectures')
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    groups = models.ManyToManyField(Group)

    def clean(self):
        # Проверка глобального ограничения на количество лекций у преподавателя в день
        if Lecture.objects.filter(
                teacher=self.teacher,
                time_slot__schedule_date__date=self.time_slot.schedule_date.date
        ).exclude(id=self.id).exists():
            raise ValueError(f"Преподаватель {self.teacher.name} уже назначен на {self.time_slot.schedule_date.date}")
            # raise ValidationError(
            #     f"Преподаватель {self.teacher.name} уже назначен на {self.time_slot.schedule_date.date}")

    def __str__(self):
        group_names = ", ".join(group.name for group in self.groups.all())
        return f"{self.teacher.name} - {self.time_slot} для групп [{group_names}]"
