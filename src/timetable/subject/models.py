from django.db import models


class Subject(models.Model):
    name = models.CharField(max_length=100)
    short_name = models.CharField(max_length=50)
    def __str__(self):
        return self.name


class LessonType(Subject):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='lessontype_subject')
    short_name = models.CharField(max_length=100)
    timelength = models.SmallIntegerField(default=0)

    def __str__(self):
        return self.short_name