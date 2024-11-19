from rest_framework.routers import DefaultRouter

from . import views

app_name = "schedule"

router = DefaultRouter()
router.register(r"schedule_dates", views.ScheduleDateViewSet)
router.register(r"lectures", views.LectureViewSet)

urlpatterns = [] + router.urls
