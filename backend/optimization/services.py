"""
Service layer for timetable generation
Coordinates between Django models and optimization engines
"""
from typing import Dict, List
import logging
from datetime import datetime, timedelta
from django.db import transaction

logger = logging.getLogger(__name__)


class TimetableGeneratorService:
    """
    Service to generate timetables using optimization engines
    """

    def __init__(self, timetable_template):
        self.timetable = timetable_template
        self.config = self._prepare_config()

    def _prepare_config(self) -> Dict:
        """Prepare configuration data for optimization engine"""
        from core.models import Course, Faculty, Room, StudentCourseEnrollment
        from timetable.models import TimeSlot

        # Get all relevant courses for this program and semester
        courses = Course.objects.filter(
            program=self.timetable.program,
            semester=self.timetable.semester.semester_number
        )

        # Prepare course data
        course_data = []
        for course in courses:
            # Get enrolled students count
            enrollment_count = StudentCourseEnrollment.objects.filter(
                course=course,
                semester=self.timetable.semester,
                is_active=True
            ).count()

            # Get qualified faculty
            qualified_faculty_ids = list(
                course.qualified_faculty.filter(
                    faculty__is_active=True
                ).values_list('faculty_id', flat=True)
            )

            # Get faculty preferences
            faculty_prefs = {}
            for expertise in course.qualified_faculty.all():
                faculty_prefs[expertise.faculty_id] = expertise.preference_level

            course_data.append({
                'id': course.id,
                'code': course.code,
                'name': course.name,
                'course_type': course.course_type,
                'credits': course.credits,
                'theory_hours': course.theory_hours,
                'practical_hours': course.practical_hours,
                'enrolled_students': enrollment_count,
                'qualified_faculty_ids': qualified_faculty_ids,
                'faculty_preferences': faculty_prefs,
                'sessions_per_week': self._calculate_sessions_per_week(course),
                'duration': 1,  # Duration in slots
            })

        # Prepare faculty data
        faculty = Faculty.objects.filter(is_active=True)
        faculty_data = []
        for fac in faculty:
            faculty_data.append({
                'id': fac.id,
                'employee_id': fac.employee_id,
                'name': fac.user.get_full_name(),
                'department_id': fac.department_id,
                'max_hours_per_week': fac.max_hours_per_week,
            })

        # Prepare room data
        rooms = Room.objects.filter(is_available=True)
        room_data = []
        for room in rooms:
            room_data.append({
                'id': room.id,
                'room_number': room.room_number,
                'room_type': room.room_type,
                'capacity': room.capacity,
                'has_projector': room.has_projector,
                'has_computer': room.has_computer,
            })

        # Generate time slots
        time_slots = self._generate_time_slots()

        return {
            'courses': course_data,
            'faculty': faculty_data,
            'rooms': room_data,
            'time_slots': time_slots,
            'prefer_morning_sessions': self.timetable.prefer_morning_sessions,
            'avoid_back_to_back_practicals': self.timetable.avoid_back_to_back_practicals,
            'max_lectures_per_day': self.timetable.max_lectures_per_day,
            'min_lectures_per_day': self.timetable.min_lectures_per_day,
        }

    def _calculate_sessions_per_week(self, course) -> int:
        """Calculate how many sessions per week a course needs"""
        total_hours = course.theory_hours + course.practical_hours
        slot_duration_hours = self.timetable.slot_duration / 60
        sessions = int(total_hours / slot_duration_hours)
        return max(1, sessions)

    def _generate_time_slots(self) -> List[Dict]:
        """Generate time slots based on timetable configuration"""
        days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
        time_slots = []

        slot_id = 1
        for day in days:
            current_time = datetime.combine(datetime.today(), self.timetable.start_time)
            end_time = datetime.combine(datetime.today(), self.timetable.end_time)
            lunch_start = datetime.combine(datetime.today(), self.timetable.lunch_break_start)
            lunch_end = lunch_start + timedelta(minutes=self.timetable.lunch_break_duration)

            slot_number = 1
            while current_time < end_time:
                slot_end = current_time + timedelta(minutes=self.timetable.slot_duration)

                # Check if this overlaps with lunch break
                if not (current_time >= lunch_start and current_time < lunch_end):
                    is_morning = current_time.hour < 12

                    time_slots.append({
                        'id': slot_id,
                        'day_of_week': day,
                        'start_time': current_time.time(),
                        'end_time': slot_end.time(),
                        'slot_number': slot_number,
                        'is_morning': is_morning,
                    })

                    slot_id += 1
                    slot_number += 1

                current_time = slot_end + timedelta(minutes=self.timetable.break_duration)

        return time_slots

    @transaction.atomic
    def generate(self) -> Dict:
        """
        Generate timetable using optimization engine
        """
        try:
            # Choose optimization engine
            engine_type = 'ortools'  # or 'genetic'

            if engine_type == 'ortools':
                from .engine import TimetableOptimizer
                optimizer = TimetableOptimizer(self.config)
            else:
                from .genetic_algorithm import GeneticTimetableOptimizer
                optimizer = GeneticTimetableOptimizer(self.config)

            # Run optimization
            result = optimizer.generate()

            # Save results to database
            if result['status'] in ['OPTIMAL', 'FEASIBLE']:
                self._save_schedule(result['schedule'])

            return result

        except Exception as e:
            logger.error(f"Error in timetable generation: {str(e)}")
            raise

    def _save_schedule(self, schedule: List[Dict]):
        """Save generated schedule to database"""
        from timetable.models import TimeSlot, ScheduledClass
        from core.models import Course, Faculty, Room

        # Clear existing schedule
        self.timetable.scheduled_classes.all().delete()
        self.timetable.time_slots.all().delete()

        # Save time slots
        time_slot_map = {}
        for slot_data in self.config['time_slots']:
            time_slot = TimeSlot.objects.create(
                timetable=self.timetable,
                day_of_week=slot_data['day_of_week'],
                start_time=slot_data['start_time'],
                end_time=slot_data['end_time'],
                slot_number=slot_data['slot_number']
            )
            time_slot_map[slot_data['id']] = time_slot

        # Save scheduled classes
        for item in schedule:
            course = Course.objects.get(id=item['course_id'])
            faculty = Faculty.objects.get(id=item['faculty_id'])
            room = Room.objects.get(id=item['room_id'])
            time_slot = time_slot_map[item['time_slot_id']]

            ScheduledClass.objects.create(
                timetable=self.timetable,
                course=course,
                faculty=faculty,
                room=room,
                time_slot=time_slot,
                class_type='LECTURE' if course.course_type == 'THEORY' else 'PRACTICAL',
                duration=self.timetable.slot_duration
            )

        logger.info(f"Saved {len(schedule)} scheduled classes")
