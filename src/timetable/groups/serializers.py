from rest_framework import serializers

from .models import Group, GroupAvailableDates


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["id", "name"]


class GroupAvailableDatesSerializer(serializers.ModelSerializer):
    group_id = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(), source="group", write_only=True
    )
    group_name = serializers.CharField(source="group.name", read_only=True)

    class Meta:
        model = GroupAvailableDates
        fields = ["id", "group_id", "group_name", "dates"]
