from rest_framework import viewsets

from .models import TeacherProfile
from .serializers import TeacherProfileSerializer


class TeacherProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet для управления профилями преподавателей:
    Преподаватель - Предмет.
    """

    queryset = TeacherProfile.objects.all()
    serializer_class = TeacherProfileSerializer
