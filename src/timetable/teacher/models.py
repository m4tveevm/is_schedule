from django.db import models


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
    shortname = models.CharField(max_length=100, blank=True)
    employer_type = models.CharField(
        max_length=20, choices=EMPLOYERTYPE.items(), default=CONTRIBUTOR
    )

    def save(self, *args, **kwargs):
        if not self.shortname:
            self.shortname = (
                f"{self.surname} {self.name[0]}." f" {self.lastname[0]}."
            )
        super().save(*args, **kwargs)

    def __str__(self):
        return self.shortname


class TeacherUnavailableDates(models.Model):
    teacher = models.OneToOneField(
        Teacher,
        on_delete=models.CASCADE,
        related_name="teacher_unavailable_dates",
    )
    dates = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.teacher} недоступен в даты: {self.dates}"
