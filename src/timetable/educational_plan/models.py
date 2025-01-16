from django.db import models

from subject.models import Subject


class EducationalPlan(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    practice_start_date = models.DateField(null=True, blank=True)
    practice_end_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.name


class EducationalPlanEntry(models.Model):
    LESSON_TYPE_UP = "УП"
    LESSON_TYPE_KL = "КЛ"
    LESSON_TYPE_DK = "ДК"

    LESSON_TYPE_CHOICES = [
        (LESSON_TYPE_UP, "Учебная практика"),
        (LESSON_TYPE_KL, "Клиническая практика"),
        (LESSON_TYPE_DK, "Доклиническая практика"),
    ]
    educational_plan = models.ForeignKey(
        EducationalPlan, on_delete=models.CASCADE, related_name="entries"
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    lesson_type = models.CharField(max_length=2, choices=LESSON_TYPE_CHOICES)
    hours = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.subject} – {self.lesson_type} – {self.hours} ч."
