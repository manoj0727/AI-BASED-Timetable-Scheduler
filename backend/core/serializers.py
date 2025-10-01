"""
Serializers for core models
"""
from rest_framework import serializers
from .models import (
    AcademicYear, Semester, Program, Department, CourseCategory,
    Course, Faculty, FacultyAvailability, FacultyCourseExpertise,
    Room, Student, StudentCourseEnrollment
)


class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = '__all__'


class SemesterSerializer(serializers.ModelSerializer):
    academic_year_display = serializers.StringRelatedField(source='academic_year', read_only=True)

    class Meta:
        model = Semester
        fields = '__all__'


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = '__all__'


class DepartmentSerializer(serializers.ModelSerializer):
    head_name = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = '__all__'

    def get_head_name(self, obj):
        return obj.head.get_full_name() if obj.head else None


class CourseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCategory
        fields = '__all__'


class CourseSerializer(serializers.ModelSerializer):
    department_name = serializers.StringRelatedField(source='department', read_only=True)
    category_name = serializers.StringRelatedField(source='category', read_only=True)
    program_name = serializers.StringRelatedField(source='program', read_only=True)

    class Meta:
        model = Course
        fields = '__all__'


class FacultySerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    department_name = serializers.StringRelatedField(source='department', read_only=True)

    class Meta:
        model = Faculty
        fields = '__all__'

    def get_full_name(self, obj):
        return obj.user.get_full_name()


class FacultyAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = FacultyAvailability
        fields = '__all__'


class FacultyCourseExpertiseSerializer(serializers.ModelSerializer):
    faculty_name = serializers.SerializerMethodField()
    course_name = serializers.StringRelatedField(source='course', read_only=True)

    class Meta:
        model = FacultyCourseExpertise
        fields = '__all__'

    def get_faculty_name(self, obj):
        return obj.faculty.user.get_full_name()


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'


class StudentSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    program_name = serializers.StringRelatedField(source='program', read_only=True)

    class Meta:
        model = Student
        fields = '__all__'

    def get_full_name(self, obj):
        return obj.user.get_full_name()


class StudentCourseEnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_name = serializers.StringRelatedField(source='course', read_only=True)

    class Meta:
        model = StudentCourseEnrollment
        fields = '__all__'

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()
