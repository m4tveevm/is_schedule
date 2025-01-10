from django.db import models

from subject.models import LessonType, Subject


class EducationalPlan(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    practice_start_date = models.DateField(null=True, blank=True)
    practice_end_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.name


class EducationalPlanEntry(models.Model):
    educational_plan = models.ForeignKey(
        EducationalPlan, related_name="entries", on_delete=models.CASCADE
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    lesson_type = models.ForeignKey(LessonType, on_delete=models.CASCADE)
    hours = models.PositiveIntegerField(default=0)

    def __str__(self):
        return (
            f"{self.subject.name} ({self.lesson_type.short_name}) -"
            f" {self.hours} ч"
        )
