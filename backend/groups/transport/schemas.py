from typing import Optional, List
from ninja import Schema


class GroupIn(Schema):
    name: str


class GroupOut(Schema):
    id: int
    name: str


class GroupDatesIn(Schema):
    group_id: int
    dates: List[str]


class GroupDatesOut(Schema):
    id: Optional[int] = None
    group_id: int
    group_name: str
    dates: List[str]
