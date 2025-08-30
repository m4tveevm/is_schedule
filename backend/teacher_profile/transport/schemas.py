from ninja import Schema
from typing import Optional


class TeacherProfileIn(Schema):
    teacher: int
    subject: int


class TeacherProfileOut(Schema):
    id: int
    teacher: int
    subject: int
    teacher_name: Optional[str] = None
    subject_name: Optional[str] = None
