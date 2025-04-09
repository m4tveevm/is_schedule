from django.contrib import admin
from django.urls import include, path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import health

urlpatterns = [
    path("health/", health),
    path("api/admin/", admin.site.urls),
    path("api-auth/", include("rest_framework.urls")),
    path(
        "api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"
    ),
    path(
        "api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"
    ),
    #
    path("api/", include("brigade_assignment.urls")),
    path("api/", include("educational_plan.urls")),
    path("api/", include("group_educational_plan.urls")),
    path("api/", include("groups.urls")),
    path("api/", include("teacher.urls")),
    path("api/", include("teacher_profile.urls")),
    path("api/", include("subject.urls")),
    path("api/user/", include("user.urls")),
    # path("api/", include("schedule.urls")),
]
