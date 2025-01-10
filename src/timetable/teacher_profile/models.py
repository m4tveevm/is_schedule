from django.db import models

from subject.models import LessonType, Subject

from teacher.models import Teacher


class TeacherProfile(models.Model):
    teacher = models.ForeignKey(
        Teacher, on_delete=models.CASCADE, related_name="profiles"
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.teacher} - {self.subject}"


class TeacherProfileAmount(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    lesson_type = models.ForeignKey(
        LessonType,
        on_delete=models.CASCADE,
        related_name="teacher_profile_contract_amount",
        null=True,
    )
    amount = models.IntegerField(default=0)
