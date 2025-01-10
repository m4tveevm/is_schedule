from django.urls import path

from .views import UpdateProfilePictureView, UserProfileView, UserSettingsView

urlpatterns = [
    path("profile/", UserProfileView.as_view(), name="user-profile"),
    path(
        "profile/upload_avatar/",
        UpdateProfilePictureView.as_view(),
        name="upload-avatar",
    ),
    path(
        "profile/settings/", UserSettingsView.as_view(), name="user-settings"
    ),
]
