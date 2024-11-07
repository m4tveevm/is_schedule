from django.urls import path
from . import views

urlpatterns = [
    path('', views.schedule_entry_list, name='schedule_entry_list'),
    path('teacher/<int:teacher_id>/', views.teacher_schedule, name='teacher_schedule'),
    path('group/<int:group_id>/', views.group_schedule, name='group_schedule'),
    path('create/', views.schedule_entry_create, name='schedule_entry_create'),
    path('update/<int:pk>/', views.schedule_entry_update, name='schedule_entry_update'),
]
