from django.db import models


class Group(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class GroupAvailableDates(models.Model):
    group = models.OneToOneField(
        Group, on_delete=models.CASCADE, related_name="available_dates"
    )
    dates = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"Доступные даты: {self.group}"
