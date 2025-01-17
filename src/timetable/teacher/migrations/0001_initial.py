# Generated by Django 5.1.4 on 2025-01-05 03:19

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Teacher",
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
                ("surname", models.CharField(max_length=100)),
                ("name", models.CharField(max_length=100)),
                ("lastname", models.CharField(max_length=100)),
                ("shortname", models.CharField(blank=True, max_length=100)),
                (
                    "employerType",
                    models.CharField(
                        choices=[
                            ("Основной", "Основное место работы"),
                            ("Совместитель", "Совместитель"),
                        ],
                        default="Совместитель",
                        max_length=20,
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="TeacherUnavailableDates",
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
                ("dates", models.JSONField(blank=True, default=list)),
                (
                    "teacher",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="teacher_unavailable_dates",
                        to="teacher.teacher",
                    ),
                ),
            ],
        ),
    ]