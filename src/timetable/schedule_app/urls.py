from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.date_selection_view, name='date_selection'),
    path('lectures/', views.adjust_lectures_view, name='adjust_lectures'),
    path('adjust_lectures/', views.adjust_lectures_view,
         name='adjust_lectures'),
    path('assign_teachers/', views.assign_teachers_view,
         name='assign_teachers'),
    path('schedule/', views.schedule_view,
         name='schedule'),
    path('schedule/group/<int:group_id>/', views.group_schedule_view,
         name='group_schedule'),
    path('schedule/teacher/<int:teacher_id>', views.teacher_schedule_view,
         name='teacher_schedule'),
    path('schedule_success/', views.schedule_success_view,
         name='schedule_success'),
]
