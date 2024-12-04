from django.db import models

from src.timetable.groups.models import Group

from src.timetable.subject.models import Subject, LessonType
from src.timetable.teacher.models import Teacher


# class EducationalPlan(models.Model):
#     lesson = models.ForeignKey(
#         Subject,
#         on_delete=models.CASCADE,
#         related_name='educational_plans_as_lesson'
#     )
#     lesson_type = models.ForeignKey(
#         LessonType,
#         on_delete=models.CASCADE,
#         related_name='educational_plans_as_lesstyper'
#     )
#     amount = models.DecimalField(decimal_places=1, max_digits=10)

class EducationalPlan(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE,
                                related_name='educational_plans_as_lesson')
    hours = models.IntegerField()
    lesson_type = models.ForeignKey(LessonType, on_delete=models.CASCADE)


class GroupConnection(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, )
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    deadline = models.DateTimeField(default=None, null=True)


class GroupBrigadeLessonTeacherConnection(GroupConnection):
    ONE = "БР 1"
    TWO = "БР 2"
    THREE = "БР 3"
    BRIGADES = {
        ONE: "Первая Бригада",
        TWO: "Вторая Бригада",
        THREE: "Третья Бригада",
    }

    educational_plan = models.ForeignKey(EducationalPlan,
                                         on_delete=models.CASCADE)
    brigade_n = models.CharField(choices=BRIGADES, default=ONE,
                                 on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
