from ninja import Schema


class TeacherOut(Schema):
    id: int
    surname: str
    name: str
    lastname: str
    shortname: str
    employer_type: str


class Message(Schema):
    detail: str


try:
    TeacherOut.model_rebuild()
except Exception:
    pass
