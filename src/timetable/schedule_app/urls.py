from django.urls import path
from . import views

urlpatterns = [
    path('add/', views.add_schedule_entry, name='add_schedule_entry'),
]
