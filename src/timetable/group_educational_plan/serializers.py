from rest_framework import serializers
from rest_framework.fields import DateField

from .models import GroupEducationalPlan


class NullableDateField(DateField):
    def to_internal_value(self, value):
        if value in [None, ""]:
            return None
        return super().to_internal_value(value)


class GroupEducationalPlanSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source="group.name", read_only=True)
    educational_plan_name = serializers.CharField(
        source="educational_plan.name", read_only=True
    )
    deadline = NullableDateField(required=False, allow_null=True)

    class Meta:
        model = GroupEducationalPlan
        fields = [
            "id",
            "group",
            "group_name",
            "educational_plan",
            "educational_plan_name",
            "deadline",
        ]
