from rest_framework import serializers

from .models import Teacher, TeacherUnavailableDates


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = [
            "id",
            "surname",
            "name",
            "lastname",
            "shortname",
            "employer_type",
        ]

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class TeacherUnavailableDatesSerializer(serializers.ModelSerializer):
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=Teacher.objects.all(), source="teacher", write_only=True
    )
    teacher_name = serializers.CharField(
        source="teacher.shortname", read_only=True
    )

    class Meta:
        model = TeacherUnavailableDates
        fields = [
            "id",
            "teacher_id",
            "teacher_name",
            "dates",
        ]
