from educational_plan.models import EducationalPlanEntry

from group_educational_plan.models import GroupEducationalPlan

from rest_framework import serializers

from .models import BrigadeAssignment


class BrigadeAssignmentSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(
        source="group_educational_plan.group.name", read_only=True
    )
    educational_plan_name = serializers.CharField(
        source="group_educational_plan.educational_plan.name", read_only=True
    )
    subject_name = serializers.CharField(
        source="educational_plan_entry.subject.name", read_only=True
    )
    lesson_type_name = serializers.CharField(
        source="educational_plan_entry.lesson_type.short_name", read_only=True
    )
    teacher_name = serializers.CharField(
        source="teacher.shortname", read_only=True
    )
    composite_id = serializers.SerializerMethodField()

    def get_composite_id(self, obj):
        return (
            f"{obj.group_educational_plan.id}-"
            f"{obj.educational_plan_entry.id}-{obj.brigade_number}"
        )

    class Meta:
        model = BrigadeAssignment
        fields = [
            "id",
            "composite_id",
            "group_educational_plan",
            "educational_plan_entry",
            "group_name",
            "educational_plan_name",
            "subject_name",
            "lesson_type_name",
            "brigade_number",
            "teacher",
            "teacher_name",
        ]


class BrigadeAssignmentBulkSerializer(serializers.Serializer):
    group_educational_plan = serializers.IntegerField()
    educational_plan_entry = serializers.IntegerField()
    brigades = serializers.ListField(
        child=serializers.DictField(
            child=serializers.IntegerField(), allow_empty=True
        )
    )

    def validate_group_educational_plan(self, value):
        if not GroupEducationalPlan.objects.filter(id=value).exists():
            raise serializers.ValidationError("Некорректный ID группы.")
        return value

    def validate_educational_plan_entry(self, value):
        if not EducationalPlanEntry.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                "Некорректный ID записи учебного плана."
            )
        return value
