from rest_framework.routers import DefaultRouter

from .views import LessonTypeViewSet, SubjectViewSet

router = DefaultRouter()
router.register(r"subjects", SubjectViewSet, basename="subject")
router.register(r"lesson_types", LessonTypeViewSet, basename="lesson_type")

urlpatterns = router.urls
