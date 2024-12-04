from django.db import models


class Teacher(models.Model):
    MAIN = "Основной"
    CONTRIBUTOR = "Совместитель"
    EMPLOYERTYPE = {
        MAIN: "Основное место работы",
        CONTRIBUTOR: "Совместитель",
    }
    name = models.CharField(max_length=100, default="")
    surname = models.CharField(max_length=100, default="")
    lastname = models.CharField(max_length=100, default="")
    shortname = models.CharField(
        max_length=100,
        blank=True,
    )
    employerType = models.CharField(choices=EMPLOYERTYPE, default=CONTRIBUTOR)

    def __str__(self):
        if self.shortname:
            return self.shortname
        return f"{str(self.surname)} {str(self.name).upper()[0]}. {str(self.lastname).upper()[0]}"
