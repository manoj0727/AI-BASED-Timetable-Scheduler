"""
Timetable models for scheduling and schedule management
"""
from django.db import models
from django.core.validators import MinValueValidator
from core.models import Semester, Course, Faculty, Room, Program


class TimetableTemplate(models.Model):
    """Master timetable configuration"""
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('GENERATING', 'Generating'),
        ('GENERATED', 'Generated'),
        ('PUBLISHED', 'Published'),
        ('ARCHIVED', 'Archived'),
    ]

    name = models.CharField(max_length=200)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='timetables')
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='timetables')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='DRAFT')
    created_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)

    # Generation parameters
    start_time = models.TimeField(default='09:00:00')
    end_time = models.TimeField(default='17:00:00')
    slot_duration = models.IntegerField(default=60, help_text="Duration in minutes")
    break_duration = models.IntegerField(default=15, help_text="Break duration in minutes")
    lunch_break_start = models.TimeField(default='13:00:00')
    lunch_break_duration = models.IntegerField(default=60, help_text="Lunch break duration in minutes")

    # Optimization parameters
    max_lectures_per_day = models.IntegerField(default=6)
    min_lectures_per_day = models.IntegerField(default=3)
    prefer_morning_sessions = models.BooleanField(default=True)
    avoid_back_to_back_practicals = models.BooleanField(default=True)

    # Metadata
    notes = models.TextField(blank=True)
    generation_time_seconds = models.FloatField(null=True, blank=True)
    optimization_score = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['semester', 'program', 'name']

    def __str__(self):
        return f"{self.name} - {self.semester}"


class TimeSlot(models.Model):
    """Time slot definitions"""
    DAYS_OF_WEEK = [
        ('MON', 'Monday'),
        ('TUE', 'Tuesday'),
        ('WED', 'Wednesday'),
        ('THU', 'Thursday'),
        ('FRI', 'Friday'),
        ('SAT', 'Saturday'),
    ]

    timetable = models.ForeignKey(TimetableTemplate, on_delete=models.CASCADE, related_name='time_slots')
    day_of_week = models.CharField(max_length=3, choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_number = models.IntegerField(validators=[MinValueValidator(1)])
    is_break = models.BooleanField(default=False)

    class Meta:
        ordering = ['day_of_week', 'start_time']
        unique_together = ['timetable', 'day_of_week', 'slot_number']

    def __str__(self):
        return f"{self.day_of_week} {self.start_time}-{self.end_time}"


class ScheduledClass(models.Model):
    """Individual scheduled class sessions"""
    CLASS_TYPES = [
        ('LECTURE', 'Lecture'),
        ('TUTORIAL', 'Tutorial'),
        ('PRACTICAL', 'Practical Lab'),
        ('SEMINAR', 'Seminar'),
    ]

    timetable = models.ForeignKey(TimetableTemplate, on_delete=models.CASCADE, related_name='scheduled_classes')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='scheduled_classes')
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='scheduled_classes')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='scheduled_classes')
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name='scheduled_classes')

    class_type = models.CharField(max_length=10, choices=CLASS_TYPES)
    duration = models.IntegerField(help_text="Duration in minutes")
    batch_name = models.CharField(max_length=50, blank=True, help_text="For divided batches")

    # Additional metadata
    is_locked = models.BooleanField(default=False, help_text="Locked classes won't be changed during re-generation")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['time_slot__day_of_week', 'time_slot__start_time']

    def __str__(self):
        return f"{self.course.code} - {self.time_slot}"


class TimetableConstraint(models.Model):
    """Custom constraints for timetable generation"""
    CONSTRAINT_TYPES = [
        ('HARD', 'Hard Constraint (Must satisfy)'),
        ('SOFT', 'Soft Constraint (Preferred)'),
    ]

    timetable = models.ForeignKey(TimetableTemplate, on_delete=models.CASCADE, related_name='constraints')
    constraint_type = models.CharField(max_length=4, choices=CONSTRAINT_TYPES)
    name = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    is_active = models.BooleanField(default=True)

    # Constraint parameters (stored as JSON)
    parameters = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.name} ({self.constraint_type})"


class ConflictLog(models.Model):
    """Logs conflicts detected during timetable generation"""
    CONFLICT_TYPES = [
        ('FACULTY', 'Faculty Double Booking'),
        ('ROOM', 'Room Double Booking'),
        ('STUDENT', 'Student Schedule Conflict'),
        ('CAPACITY', 'Room Capacity Exceeded'),
        ('AVAILABILITY', 'Faculty/Room Unavailable'),
    ]

    timetable = models.ForeignKey(TimetableTemplate, on_delete=models.CASCADE, related_name='conflicts')
    conflict_type = models.CharField(max_length=15, choices=CONFLICT_TYPES)
    description = models.TextField()
    severity = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="1=Low, 5=Critical"
    )
    resolved = models.BooleanField(default=False)
    detected_at = models.DateTimeField(auto_now_add=True)

    # Related objects (optional, for specific conflicts)
    related_class_1 = models.ForeignKey(
        ScheduledClass,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='conflicts_1'
    )
    related_class_2 = models.ForeignKey(
        ScheduledClass,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='conflicts_2'
    )

    class Meta:
        ordering = ['-severity', '-detected_at']

    def __str__(self):
        return f"{self.conflict_type} - {self.timetable}"


class TeachingPracticeSchedule(models.Model):
    """Special schedule for B.Ed./M.Ed. teaching practice"""
    timetable = models.ForeignKey(TimetableTemplate, on_delete=models.CASCADE, related_name='teaching_practice')
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    school_name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    days_per_week = models.IntegerField(default=5)
    hours_per_day = models.IntegerField(default=4)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.faculty} - {self.school_name}"


class FieldworkSchedule(models.Model):
    """Schedule for fieldwork and internships"""
    timetable = models.ForeignKey(TimetableTemplate, on_delete=models.CASCADE, related_name='fieldwork')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    faculty_supervisor = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    organization = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    total_hours = models.IntegerField()
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.course} - {self.organization}"
