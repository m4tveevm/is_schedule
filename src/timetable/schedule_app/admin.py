from django.contrib import admin

from .models import Group, Lecture, ScheduleDate, Teacher

admin.site.register(Group)
admin.site.register(Teacher)
admin.site.register(ScheduleDate)
admin.site.register(Lecture)
