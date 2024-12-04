# Generated by Django 5.1.3 on 2024-11-21 13:41

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Subject",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name="LessonType",
            fields=[
                (
                    "subject_ptr",
                    models.OneToOneField(
                        auto_created=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        parent_link=True,
                        primary_key=True,
                        serialize=False,
                        to="subject.subject",
                    ),
                ),
                ("short_name", models.CharField(max_length=100)),
                ("timelength", models.SmallIntegerField(default=0)),
                (
                    "subject",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="lessontype_subject",
                        to="subject.subject",
                    ),
                ),
            ],
            bases=("subject.subject",),
        ),
    ]
