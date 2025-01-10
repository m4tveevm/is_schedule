from rest_framework.routers import DefaultRouter

from .views import BrigadeAssignmentViewSet

router = DefaultRouter()
router.register(r"brigade_assignments", BrigadeAssignmentViewSet)

urlpatterns = router.urls
