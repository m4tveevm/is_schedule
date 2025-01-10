from django.core.management.base import BaseCommand

import pandas as pd

from subject.models import Subject

from teacher.models import Teacher, TeacherProfile


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("file_path", type=str, help="Путь к Excel файлу")

    def handle(self, *args, **kwargs):
        file_path = kwargs["file_path"]
        data = pd.read_excel(file_path)

        data[["Фамилия", "Имя", "Отчество"]] = data["ФИО"].str.split(
            " ", expand=True, n=2
        )

        for _, row in data.iterrows():
            teacher, created = Teacher.objects.get_or_create(
                surname=row["Фамилия"],
                name=row["Имя"],
                lastname=row["Отчество"],
                employerType=Teacher.CONTRIBUTOR,
            )
            if row["Название предмета"] == "nan":
                continue

            subject, created = Subject.objects.get_or_create(
                name=row["Название предмета"]
            )

            TeacherProfile.objects.get_or_create(
                teacher=teacher, subject=subject
            )

        self.stdout.write(self.style.SUCCESS("Импорт завершен!"))
