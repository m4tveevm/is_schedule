from rest_framework.routers import DefaultRouter

from .views import GroupAvailableDatesViewSet, GroupViewSet

router = DefaultRouter()

router.register(r"groups", GroupViewSet, basename="group")
router.register(
    r"group_available_dates",
    GroupAvailableDatesViewSet,
    basename="group_available",
)

urlpatterns = router.urls
