# Generated by Django 5.1.4 on 2025-01-16 20:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("educational_plan", "0002_alter_educationalplanentry_hours_and_more"),
        ("subject", "0001_initial"),
        ("teacher_profile", "0002_alter_teacherprofileamount_lesson_type"),
    ]

    operations = [
        migrations.DeleteModel(
            name="LessonType",
        ),
    ]