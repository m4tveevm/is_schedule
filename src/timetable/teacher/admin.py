from django.contrib import admin

from .models import Teacher, TeacherProfile, TeacherEduAmount

admin.site.register(Teacher)
admin.site.register(TeacherProfile)
admin.site.register(TeacherEduAmount)