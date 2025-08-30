from typing import Optional
from ninja import Schema


class SubjectIn(Schema):
    name: str
    short_name: Optional[str] = ""


class SubjectOut(Schema):
    id: int
    name: str
    short_name: str
