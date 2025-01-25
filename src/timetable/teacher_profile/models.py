from django.db import models

from subject.models import Subject

from teacher.models import Teacher


class TeacherProfile(models.Model):
    teacher = models.ForeignKey(
        Teacher, on_delete=models.CASCADE, related_name="profiles"
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.teacher} - {self.subject}"


class TeacherProfileAmount(models.Model):
    LESSON_TYPE_UP = "УП"
    LESSON_TYPE_KL = "КЛ"
    LESSON_TYPE_DK = "ДК"

    LESSON_TYPE_CHOICES = [
        (LESSON_TYPE_UP, "Учебная практика"),
        (LESSON_TYPE_KL, "Контрольная работа / Коллоквиум"),
        (LESSON_TYPE_DK, "Другое занятие"),
    ]

    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)

    lesson_type = models.CharField(max_length=2, choices=LESSON_TYPE_CHOICES)

    amount = models.IntegerField(default=0)

    def __str__(self):
        return (
            f"{self.teacher} - "
            f"{self.get_lesson_type_display()} - {self.amount}"
        )
