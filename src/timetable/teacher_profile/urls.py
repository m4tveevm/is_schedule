from rest_framework.routers import DefaultRouter

from .views import TeacherProfileViewSet

router = DefaultRouter()
router.register(
    r"teacher_profiles", TeacherProfileViewSet, basename="teacherprofile"
)

urlpatterns = router.urls
