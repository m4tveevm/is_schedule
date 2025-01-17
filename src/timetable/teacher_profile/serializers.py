from rest_framework import serializers

from subject.models import Subject

from teacher.models import Teacher

from .models import TeacherProfile, TeacherProfileAmount


class TeacherProfileSerializer(serializers.ModelSerializer):
    teacher = serializers.PrimaryKeyRelatedField(
        queryset=Teacher.objects.all()
    )
    subject = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all()
    )

    teacher_name = serializers.CharField(
        source="teacher.shortname", read_only=True
    )
    subject_name = serializers.CharField(source="subject.name", read_only=True)

    class Meta:
        model = TeacherProfile
        fields = [
            "id",
            "teacher",
            "teacher_name",
            "subject",
            "subject_name",
        ]


class TeacherProfileAmountSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(
        source="teacher.shortname", read_only=True
    )
    lesson_type_name = serializers.CharField(
        source="get_lesson_type_display", read_only=True
    )

    class Meta:
        model = TeacherProfileAmount
        fields = [
            "id",
            "teacher",
            "teacher_name",
            "lesson_type",
            "lesson_type_name",
            "amount",
        ]
