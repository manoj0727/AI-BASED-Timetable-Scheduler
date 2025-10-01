"""
Core models for NEP 2020 Timetable Scheduler
These models represent the foundational entities required for timetable generation
"""
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class AcademicYear(models.Model):
    """Academic Year configuration"""
    year = models.CharField(max_length=20, unique=True)  # e.g., "2024-2025"
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-year']

    def __str__(self):
        return self.year


class Semester(models.Model):
    """Semester within an academic year"""
    SEMESTER_CHOICES = [
        ('ODD', 'Odd Semester'),
        ('EVEN', 'Even Semester'),
    ]

    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='semesters')
    semester_type = models.CharField(max_length=4, choices=SEMESTER_CHOICES)
    semester_number = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(8)])
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=False)

    class Meta:
        ordering = ['academic_year', 'semester_number']
        unique_together = ['academic_year', 'semester_number']

    def __str__(self):
        return f"{self.academic_year} - Semester {self.semester_number}"


class Program(models.Model):
    """Education Programs: B.Ed., M.Ed., FYUP, ITEP"""
    PROGRAM_TYPES = [
        ('FYUP', 'Four Year Undergraduate Programme'),
        ('ITEP', 'Integrated Teacher Education Programme'),
        ('BED', 'Bachelor of Education'),
        ('MED', 'Master of Education'),
    ]

    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    program_type = models.CharField(max_length=4, choices=PROGRAM_TYPES)
    duration_years = models.IntegerField()
    total_credits = models.IntegerField()
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


class Department(models.Model):
    """Academic Departments"""
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    head = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='headed_departments')
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


class CourseCategory(models.Model):
    """NEP 2020 Course Categories"""
    CATEGORY_TYPES = [
        ('MAJOR', 'Major Course'),
        ('MINOR', 'Minor Course'),
        ('SKILL', 'Skill-Based Course'),
        ('AEC', 'Ability Enhancement Course'),
        ('VAC', 'Value-Added Course'),
        ('SEC', 'Skill Enhancement Course'),
        ('MDC', 'Multidisciplinary Course'),
    ]

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    category_type = models.CharField(max_length=10, choices=CATEGORY_TYPES)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


class Course(models.Model):
    """Academic Courses"""
    COURSE_TYPES = [
        ('THEORY', 'Theory'),
        ('PRACTICAL', 'Practical'),
        ('HYBRID', 'Theory + Practical'),
    ]

    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='courses')
    category = models.ForeignKey(CourseCategory, on_delete=models.SET_NULL, null=True)
    course_type = models.CharField(max_length=10, choices=COURSE_TYPES)
    credits = models.IntegerField(validators=[MinValueValidator(1)])
    theory_hours = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    practical_hours = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='courses')
    semester = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(8)])
    is_elective = models.BooleanField(default=False)
    max_students = models.IntegerField(default=60)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['program', 'semester', 'code']

    def __str__(self):
        return f"{self.code} - {self.name}"


class Faculty(models.Model):
    """Faculty members"""
    DESIGNATION_CHOICES = [
        ('PROF', 'Professor'),
        ('ASSOC_PROF', 'Associate Professor'),
        ('ASST_PROF', 'Assistant Professor'),
        ('LECTURER', 'Lecturer'),
        ('GUEST', 'Guest Faculty'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='faculty_members')
    designation = models.CharField(max_length=20, choices=DESIGNATION_CHOICES)
    specialization = models.CharField(max_length=200)
    max_hours_per_week = models.IntegerField(default=20, validators=[MinValueValidator(1)])
    phone = models.CharField(max_length=15, blank=True)
    email = models.EmailField()
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Faculty'

    def __str__(self):
        return f"{self.employee_id} - {self.user.get_full_name()}"


class FacultyAvailability(models.Model):
    """Faculty availability for scheduling"""
    DAYS_OF_WEEK = [
        ('MON', 'Monday'),
        ('TUE', 'Tuesday'),
        ('WED', 'Wednesday'),
        ('THU', 'Thursday'),
        ('FRI', 'Friday'),
        ('SAT', 'Saturday'),
    ]

    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='availability')
    day_of_week = models.CharField(max_length=3, choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Faculty Availabilities'
        unique_together = ['faculty', 'day_of_week', 'start_time']

    def __str__(self):
        return f"{self.faculty} - {self.day_of_week} {self.start_time}-{self.end_time}"


class FacultyCourseExpertise(models.Model):
    """Maps faculty expertise to courses they can teach"""
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='course_expertise')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='qualified_faculty')
    preference_level = models.IntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="1=Least Preferred, 5=Most Preferred"
    )

    class Meta:
        unique_together = ['faculty', 'course']

    def __str__(self):
        return f"{self.faculty} - {self.course}"


class Room(models.Model):
    """Classrooms and Labs"""
    ROOM_TYPES = [
        ('CLASSROOM', 'Classroom'),
        ('LAB', 'Laboratory'),
        ('SEMINAR', 'Seminar Hall'),
        ('AUDITORIUM', 'Auditorium'),
    ]

    name = models.CharField(max_length=100)
    room_number = models.CharField(max_length=20, unique=True)
    room_type = models.CharField(max_length=15, choices=ROOM_TYPES)
    capacity = models.IntegerField(validators=[MinValueValidator(1)])
    building = models.CharField(max_length=100)
    floor = models.IntegerField()
    has_projector = models.BooleanField(default=False)
    has_computer = models.BooleanField(default=False)
    has_ac = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.room_number} - {self.name}"


class Student(models.Model):
    """Student information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    student_id = models.CharField(max_length=20, unique=True)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='students')
    current_semester = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(8)])
    enrollment_year = models.IntegerField()
    phone = models.CharField(max_length=15, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.student_id} - {self.user.get_full_name()}"


class StudentCourseEnrollment(models.Model):
    """Tracks student course enrollments including electives"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrolled_students')
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
    enrollment_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['student', 'course', 'semester']

    def __str__(self):
        return f"{self.student} - {self.course}"
