from django.core.exceptions import ValidationError
from django.core.validators import URLValidator

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserProfileSerializer, UserSettingsSerializer


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateProfilePictureView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        avatar_url = request.data.get("avatar_url")
        if avatar_url:
            validator = URLValidator()
            try:
                validator(avatar_url)
                user.avatar = avatar_url
                user.save()
                return Response(
                    {"avatar": user.avatar}, status=status.HTTP_200_OK
                )
            except ValidationError:
                return Response(
                    {"error": "Invalid URL"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return Response(
            {"error": "No avatar URL provided"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class UserSettingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        serializer = UserSettingsSerializer(
            request.user, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
