from django.urls import path

from rest_framework.routers import DefaultRouter

from .views import GroupEducationalPlanViewSet, group_plan_remaining

router = DefaultRouter()
router.register(r"group_educational_plans", GroupEducationalPlanViewSet)

urlpatterns = router.urls + [
    path("educational_plans/remaining", group_plan_remaining),
]
