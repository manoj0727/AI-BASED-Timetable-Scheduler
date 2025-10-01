"""
Django admin configuration for core models
"""
from django.contrib import admin
from .models import (
    AcademicYear, Semester, Program, Department, CourseCategory,
    Course, Faculty, FacultyAvailability, FacultyCourseExpertise,
    Room, Student, StudentCourseEnrollment
)


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ['year', 'start_date', 'end_date', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['year']


@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = ['academic_year', 'semester_type', 'semester_number', 'start_date', 'end_date', 'is_active']
    list_filter = ['academic_year', 'semester_type', 'is_active']
    ordering = ['-academic_year', 'semester_number']


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'program_type', 'duration_years', 'total_credits', 'is_active']
    list_filter = ['program_type', 'is_active']
    search_fields = ['name', 'code']


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'head']
    search_fields = ['name', 'code']


@admin.register(CourseCategory)
class CourseCategoryAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category_type']
    list_filter = ['category_type']
    search_fields = ['name', 'code']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'department', 'program', 'semester', 'course_type', 'credits', 'is_elective']
    list_filter = ['department', 'program', 'semester', 'course_type', 'is_elective']
    search_fields = ['name', 'code']
    ordering = ['program', 'semester', 'code']


class FacultyAvailabilityInline(admin.TabularInline):
    model = FacultyAvailability
    extra = 1


class FacultyCourseExpertiseInline(admin.TabularInline):
    model = FacultyCourseExpertise
    extra = 1


@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'get_full_name', 'department', 'designation', 'max_hours_per_week', 'is_active']
    list_filter = ['department', 'designation', 'is_active']
    search_fields = ['employee_id', 'user__first_name', 'user__last_name', 'specialization']
    inlines = [FacultyAvailabilityInline, FacultyCourseExpertiseInline]

    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Name'


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['room_number', 'name', 'room_type', 'capacity', 'building', 'floor', 'is_available']
    list_filter = ['room_type', 'building', 'is_available']
    search_fields = ['name', 'room_number']


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['student_id', 'get_full_name', 'program', 'current_semester', 'enrollment_year', 'is_active']
    list_filter = ['program', 'current_semester', 'is_active']
    search_fields = ['student_id', 'user__first_name', 'user__last_name']

    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Name'


@admin.register(StudentCourseEnrollment)
class StudentCourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'semester', 'enrollment_date', 'is_active']
    list_filter = ['semester', 'is_active']
    search_fields = ['student__student_id', 'course__code', 'course__name']
