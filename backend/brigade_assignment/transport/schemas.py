from __future__ import annotations
from typing import Optional, List
from ninja import Schema


class OkOut(Schema):
    ok: bool
    message: Optional[str] = None


class BrigadeItemIn(Schema):
    brigade_number: int
    teacher: Optional[int] = None


class BrigadeBulkIn(Schema):
    group_educational_plan: int
    educational_plan_entry: int
    brigades: List[BrigadeItemIn]


class BrigadeRowOut(Schema):
    id: int
    composite_id: str
    group_educational_plan: int
    educational_plan_entry: int
    group_name: str
    educational_plan_name: str
    subject_name: str
    lesson_type_name: str
    brigade_number: int
    teacher: Optional[int] = None
    teacher_name: Optional[str] = None


for _m in (OkOut, BrigadeItemIn, BrigadeBulkIn, BrigadeRowOut):
    try:
        _m.model_rebuild()
    except Exception:
        pass
