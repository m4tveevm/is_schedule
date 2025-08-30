from django.contrib import admin
from django.urls import include, path
from .views import health
from .api import api as ninja_api


urlpatterns = [
    path("health/", health),
    path("api/admin/", admin.site.urls),
    path("accounts/", include("allauth.urls")),
    path("api/", ninja_api.urls),
]
