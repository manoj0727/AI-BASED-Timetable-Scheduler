"""
Django admin configuration for timetable models
"""
from django.contrib import admin
from .models import (
    TimetableTemplate, TimeSlot, ScheduledClass, TimetableConstraint,
    ConflictLog, TeachingPracticeSchedule, FieldworkSchedule
)


class TimeSlotInline(admin.TabularInline):
    model = TimeSlot
    extra = 0


class ScheduledClassInline(admin.TabularInline):
    model = ScheduledClass
    extra = 0
    fields = ['course', 'faculty', 'room', 'time_slot', 'class_type', 'is_locked']


@admin.register(TimetableTemplate)
class TimetableTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'semester', 'program', 'status', 'created_at', 'optimization_score']
    list_filter = ['status', 'semester', 'program']
    search_fields = ['name']
    inlines = [ScheduledClassInline]
    readonly_fields = ['created_at', 'updated_at', 'published_at', 'generation_time_seconds', 'optimization_score']


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ['timetable', 'day_of_week', 'slot_number', 'start_time', 'end_time', 'is_break']
    list_filter = ['timetable', 'day_of_week', 'is_break']
    ordering = ['timetable', 'day_of_week', 'slot_number']


@admin.register(ScheduledClass)
class ScheduledClassAdmin(admin.ModelAdmin):
    list_display = ['course', 'faculty', 'room', 'time_slot', 'class_type', 'duration', 'is_locked']
    list_filter = ['timetable', 'class_type', 'is_locked']
    search_fields = ['course__code', 'course__name', 'faculty__user__first_name', 'faculty__user__last_name']


@admin.register(TimetableConstraint)
class TimetableConstraintAdmin(admin.ModelAdmin):
    list_display = ['name', 'timetable', 'constraint_type', 'priority', 'is_active']
    list_filter = ['timetable', 'constraint_type', 'is_active']
    search_fields = ['name', 'description']


@admin.register(ConflictLog)
class ConflictLogAdmin(admin.ModelAdmin):
    list_display = ['timetable', 'conflict_type', 'severity', 'resolved', 'detected_at']
    list_filter = ['timetable', 'conflict_type', 'severity', 'resolved']
    readonly_fields = ['detected_at']


@admin.register(TeachingPracticeSchedule)
class TeachingPracticeScheduleAdmin(admin.ModelAdmin):
    list_display = ['faculty', 'school_name', 'start_date', 'end_date', 'days_per_week', 'hours_per_day']
    list_filter = ['timetable', 'faculty']
    search_fields = ['school_name', 'location']


@admin.register(FieldworkSchedule)
class FieldworkScheduleAdmin(admin.ModelAdmin):
    list_display = ['course', 'faculty_supervisor', 'organization', 'start_date', 'end_date', 'total_hours']
    list_filter = ['timetable', 'course', 'faculty_supervisor']
    search_fields = ['organization', 'location']
