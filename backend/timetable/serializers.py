"""
Serializers for timetable models
"""
from rest_framework import serializers
from .models import (
    TimetableTemplate, TimeSlot, ScheduledClass, TimetableConstraint,
    ConflictLog, TeachingPracticeSchedule, FieldworkSchedule
)


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = '__all__'


class ScheduledClassSerializer(serializers.ModelSerializer):
    course_name = serializers.StringRelatedField(source='course', read_only=True)
    faculty_name = serializers.SerializerMethodField()
    room_name = serializers.StringRelatedField(source='room', read_only=True)
    time_slot_details = TimeSlotSerializer(source='time_slot', read_only=True)

    class Meta:
        model = ScheduledClass
        fields = '__all__'

    def get_faculty_name(self, obj):
        return obj.faculty.user.get_full_name()


class TimetableConstraintSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimetableConstraint
        fields = '__all__'


class ConflictLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConflictLog
        fields = '__all__'


class TimetableTemplateSerializer(serializers.ModelSerializer):
    semester_display = serializers.StringRelatedField(source='semester', read_only=True)
    program_display = serializers.StringRelatedField(source='program', read_only=True)
    scheduled_classes = ScheduledClassSerializer(many=True, read_only=True)
    time_slots = TimeSlotSerializer(many=True, read_only=True)
    constraints = TimetableConstraintSerializer(many=True, read_only=True)
    conflicts = ConflictLogSerializer(many=True, read_only=True)

    class Meta:
        model = TimetableTemplate
        fields = '__all__'


class TeachingPracticeScheduleSerializer(serializers.ModelSerializer):
    faculty_name = serializers.SerializerMethodField()

    class Meta:
        model = TeachingPracticeSchedule
        fields = '__all__'

    def get_faculty_name(self, obj):
        return obj.faculty.user.get_full_name()


class FieldworkScheduleSerializer(serializers.ModelSerializer):
    course_name = serializers.StringRelatedField(source='course', read_only=True)
    faculty_name = serializers.SerializerMethodField()

    class Meta:
        model = FieldworkSchedule
        fields = '__all__'

    def get_faculty_name(self, obj):
        return obj.faculty_supervisor.user.get_full_name()
