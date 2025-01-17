from django.db import models

from educational_plan.models import EducationalPlanEntry

from group_educational_plan.models import GroupEducationalPlan

from teacher.models import Teacher


class BrigadeAssignment(models.Model):
    BRIGADE_CHOICES = [
        (1, "Бригада 1"),
        (2, "Бригада 2"),
        (3, "Бригада 3"),
    ]
    group_educational_plan = models.ForeignKey(
        GroupEducationalPlan, on_delete=models.CASCADE
    )
    educational_plan_entry = models.ForeignKey(
        EducationalPlanEntry, on_delete=models.CASCADE
    )
    brigade_number = models.PositiveSmallIntegerField(choices=BRIGADE_CHOICES)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)

    def __str__(self):
        return (
            f"{self.group_educational_plan.group.name} - "
            f"{self.educational_plan_entry.subject.name} - "
            f"Бригада {self.brigade_number} - {self.teacher.shortname}"
        )
