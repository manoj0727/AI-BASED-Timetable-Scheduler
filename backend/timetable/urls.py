"""
URL routing for timetable app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'templates', views.TimetableTemplateViewSet)
router.register(r'timeslots', views.TimeSlotViewSet)
router.register(r'scheduled-classes', views.ScheduledClassViewSet)
router.register(r'constraints', views.TimetableConstraintViewSet)
router.register(r'conflicts', views.ConflictLogViewSet)
router.register(r'teaching-practice', views.TeachingPracticeScheduleViewSet)
router.register(r'fieldwork', views.FieldworkScheduleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
