from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"teachers", views.TeacherViewSet)

app_name = "teachers"

urlpatterns = [] + router.urls
