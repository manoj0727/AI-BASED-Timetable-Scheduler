"""
API views for core models
"""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    AcademicYear, Semester, Program, Department, CourseCategory,
    Course, Faculty, FacultyAvailability, FacultyCourseExpertise,
    Room, Student, StudentCourseEnrollment
)
from .serializers import (
    AcademicYearSerializer, SemesterSerializer, ProgramSerializer,
    DepartmentSerializer, CourseCategorySerializer, CourseSerializer,
    FacultySerializer, FacultyAvailabilitySerializer, FacultyCourseExpertiseSerializer,
    RoomSerializer, StudentSerializer, StudentCourseEnrollmentSerializer
)


class AcademicYearViewSet(viewsets.ModelViewSet):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['year']
    ordering_fields = ['year', 'created_at']


class SemesterViewSet(viewsets.ModelViewSet):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['academic_year', 'semester_type', 'is_active']
    ordering_fields = ['semester_number', 'start_date']


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['program_type', 'is_active']
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'code']


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'code']


class CourseCategoryViewSet(viewsets.ModelViewSet):
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category_type']
    search_fields = ['name', 'code']


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'category', 'program', 'semester', 'course_type', 'is_elective']
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'code', 'semester']


class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'designation', 'is_active']
    search_fields = ['employee_id', 'user__first_name', 'user__last_name', 'specialization']
    ordering_fields = ['employee_id', 'user__last_name']


class FacultyAvailabilityViewSet(viewsets.ModelViewSet):
    queryset = FacultyAvailability.objects.all()
    serializer_class = FacultyAvailabilitySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['faculty', 'day_of_week', 'is_available']


class FacultyCourseExpertiseViewSet(viewsets.ModelViewSet):
    queryset = FacultyCourseExpertise.objects.all()
    serializer_class = FacultyCourseExpertiseSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['faculty', 'course']


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['room_type', 'is_available']
    search_fields = ['name', 'room_number', 'building']
    ordering_fields = ['room_number', 'capacity']


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['program', 'current_semester', 'is_active']
    search_fields = ['student_id', 'user__first_name', 'user__last_name']
    ordering_fields = ['student_id', 'user__last_name']


class StudentCourseEnrollmentViewSet(viewsets.ModelViewSet):
    queryset = StudentCourseEnrollment.objects.all()
    serializer_class = StudentCourseEnrollmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student', 'course', 'semester', 'is_active']
