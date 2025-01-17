from rest_framework.routers import DefaultRouter

from .views import TeacherUnavailableDatesViewSet, TeacherViewSet

router = DefaultRouter()
router.register(r"teachers", TeacherViewSet)
router.register(
    r"teacher_unavailable_dates",
    TeacherUnavailableDatesViewSet,
    basename="teacher_unavailable",
)

urlpatterns = router.urls
