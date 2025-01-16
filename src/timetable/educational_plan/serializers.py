from rest_framework import serializers

from subject.models import Subject

from .models import EducationalPlan, EducationalPlanEntry


class EducationalPlanEntrySerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    lesson_type_name = serializers.CharField(
        source="lesson_type.short_name", read_only=True
    )

    class Meta:
        model = EducationalPlanEntry
        fields = [
            "id",
            "subject",
            "subject_name",
            "lesson_type",
            "lesson_type_name",
            "hours",
        ]


class EducationalPlanSerializer(serializers.ModelSerializer):
    entries = serializers.SerializerMethodField()

    practice_start_date = serializers.DateField(
        required=False, allow_null=True
    )
    practice_end_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = EducationalPlan
        fields = [
            "id",
            "name",
            "description",
            "practice_start_date",
            "practice_end_date",
            "entries",
        ]

    def get_entries(self, obj):
        grouped = {}
        for entry in obj.entries.all():
            subj_id = entry.subject.id
            if subj_id not in grouped:
                grouped[subj_id] = {
                    "subject": subj_id,
                    "УП": 0,
                    "КЛ": 0,
                    "ДК": 0,
                }
            lt_name = entry.lesson_type
            if lt_name in grouped[subj_id]:
                grouped[subj_id][lt_name] = entry.hours
        return list(grouped.values())

    def to_internal_value(self, data):
        internal = super().to_internal_value(data)
        entries = data.get("entries", [])
        internal["entries"] = entries
        return internal

    def validate(self, attrs):
        start = attrs.get("practice_start_date")
        end = attrs.get("practice_end_date")

        if (start and not end) or (end and not start):
            raise serializers.ValidationError(
                "Нельзя указать только одну дату практики — "
                "нужно обе или ни одной."
            )
        return attrs

    def create(self, validated_data):
        entries_data = validated_data.pop("entries", [])
        educational_plan = EducationalPlan.objects.create(**validated_data)
        self.handle_plan_entries(educational_plan, entries_data)
        return educational_plan

    def update(self, instance, validated_data):
        entries_data = validated_data.pop("entries", [])
        instance.name = validated_data.get("name", instance.name)
        instance.description = validated_data.get(
            "description", instance.description
        )
        instance.practice_start_date = validated_data.get(
            "practice_start_date", instance.practice_start_date
        )
        instance.practice_end_date = validated_data.get(
            "practice_end_date", instance.practice_end_date
        )
        instance.save()
        self.handle_plan_entries(instance, entries_data)
        return instance

    def handle_plan_entries(self, educational_plan, entries_data):
        EducationalPlanEntry.objects.filter(
            educational_plan=educational_plan
        ).delete()
        lesson_type_keys = ["УП", "КЛ", "ДК"]

        for entry in entries_data:
            subject_id = entry.get("subject")
            if not subject_id:
                continue
            try:
                subject = Subject.objects.get(id=subject_id)
            except Subject.DoesNotExist:
                continue
            for lt_name in lesson_type_keys:
                hours = entry.get(lt_name, 0)
                if hours:
                    EducationalPlanEntry.objects.create(
                        educational_plan=educational_plan,
                        subject=subject,
                        lesson_type=lt_name,
                        hours=hours,
                    )
