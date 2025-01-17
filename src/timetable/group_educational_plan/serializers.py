from rest_framework import serializers

from .models import GroupEducationalPlan


class GroupEducationalPlanSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source="group.name", read_only=True)
    educational_plan_name = serializers.CharField(
        source="educational_plan.name", read_only=True
    )

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
