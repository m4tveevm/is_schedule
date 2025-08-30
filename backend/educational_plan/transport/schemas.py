from ninja import Schema


class PlanEntryOut(Schema):
    id: int
    subject_name: str
    lesson_type: str
