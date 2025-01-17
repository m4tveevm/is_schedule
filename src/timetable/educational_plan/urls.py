from rest_framework.routers import DefaultRouter

from .views import EducationalPlanViewSet

router = DefaultRouter()
router.register(r"educational_plans", EducationalPlanViewSet)

urlpatterns = router.urls
