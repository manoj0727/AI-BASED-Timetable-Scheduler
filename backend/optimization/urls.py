"""
URL routing for optimization app
"""
from django.urls import path
from . import views

urlpatterns = [
    path('status/<str:task_id>/', views.get_task_status, name='task-status'),
]
