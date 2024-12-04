from django.db import models

from src.timetable.subject.models import Subject, LessonType


class Teacher(models.Model):
    MAIN = "Основной"
    CONTRIBUTOR = "Совместитель"
    EMPLOYERTYPE = {
        MAIN: "Основное место работы",
        CONTRIBUTOR: "Совместитель",
    }
    surname = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100)
    shortname = models.CharField(
        max_length=100,
        blank=True,
    )
    employerType = models.CharField(choices=EMPLOYERTYPE, default=CONTRIBUTOR)

    def __str__(self):
        if self.shortname:
            return self.shortname
        return f"{str(self.surname)} {str(self.name).upper()[0]}. {str(self.lastname).upper()[0]}"



class TeacherProfile(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.teacher} - {self.subject}"

class TeacherEduAmount(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    lesson_type = models.ForeignKey(
        LessonType,
        on_delete=models.CASCADE,
        related_name='teacher_edu_amount_as_lesstyper'
    )
    amount = models.IntegerField(default=0)
