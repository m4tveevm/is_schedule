from django.db import models

from educational_plan.models import EducationalPlan

from groups.models import Group


class GroupEducationalPlan(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    educational_plan = models.ForeignKey(
        EducationalPlan, on_delete=models.CASCADE
    )
    deadline = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.group.name} - {self.educational_plan.name}"
