from ninja import Schema
from typing import Optional


class GroupPlanRowOut(Schema):
    id: int
    group_name: str
    educational_plan_name: str


class GroupPlanSearchOut(Schema):
    id: int
    group: Optional[str] = None
    educational_plan: Optional[str] = None
    group_name: Optional[str] = None
    educational_plan_name: Optional[str] = None
