"""
URL routing for core app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'academic-years', views.AcademicYearViewSet)
router.register(r'semesters', views.SemesterViewSet)
router.register(r'programs', views.ProgramViewSet)
router.register(r'departments', views.DepartmentViewSet)
router.register(r'course-categories', views.CourseCategoryViewSet)
router.register(r'courses', views.CourseViewSet)
router.register(r'faculty', views.FacultyViewSet)
router.register(r'faculty-availability', views.FacultyAvailabilityViewSet)
router.register(r'faculty-expertise', views.FacultyCourseExpertiseViewSet)
router.register(r'rooms', views.RoomViewSet)
router.register(r'students', views.StudentViewSet)
router.register(r'enrollments', views.StudentCourseEnrollmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
