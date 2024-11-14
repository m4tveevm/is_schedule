from django.urls import path

from . import views

urlpatterns = [
    path("", views.home_view, name='home'),
    path("create/", views.date_selection_view, name="date_selection"),
    path("adjust_lectures/", views.adjust_lectures_view, name="adjust_lectures"),
    path("assign_teachers/", views.assign_teachers_view, name="assign_teachers"),
    path("schedule/group/",views.group_schedule_view,name="group_schedule",),
    path("schedule/teacher/",views.teacher_schedule_view,name="teacher_schedule",),
    path("schedule_success/",views.schedule_success_view,name="schedule_success",),


    path('manage/groups/', views.group_list_view, name='group_list'),
    path('manage/groups/add/', views.group_create_view, name='group_add'),
    path('manage/groups/<int:id>/edit/', views.group_update_view,name='group_edit'),
    path('manage/groups/<int:id>/delete/', views.group_delete_view,name='group_delete'),


    path('manage/teachers/', views.teacher_list_view, name='teacher_list'),
    path('manage/teachers/add/', views.teacher_create_view,name='teacher_add'),
    path('manage/teachers/<int:id>/edit/', views.teacher_update_view,name='teacher_edit'),
    path('manage/teachers/<int:id>/delete/', views.teacher_delete_view,name='teacher_delete'),
]
