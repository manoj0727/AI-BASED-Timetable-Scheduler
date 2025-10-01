"""
Core Optimization Engine using OR-Tools
Implements constraint programming for timetable generation
"""
from ortools.sat.python import cp_model
from typing import List, Dict, Tuple
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class TimetableOptimizer:
    """
    Main optimization engine for generating conflict-free timetables
    Uses Google OR-Tools CP-SAT solver
    """

    def __init__(self, timetable_config: Dict):
        self.config = timetable_config
        self.model = cp_model.CpModel()
        self.solver = cp_model.CpSolver()
        self.variables = {}
        self.solution = None

    def create_variables(self):
        """Create decision variables for the optimization model"""
        courses = self.config['courses']
        time_slots = self.config['time_slots']
        faculty = self.config['faculty']
        rooms = self.config['rooms']

        # Main decision variable: (course, time_slot, faculty, room)
        for course in courses:
            for slot in time_slots:
                for fac in faculty:
                    for room in rooms:
                        var_name = f"c{course['id']}_s{slot['id']}_f{fac['id']}_r{room['id']}"
                        self.variables[var_name] = self.model.NewBoolVar(var_name)

        logger.info(f"Created {len(self.variables)} decision variables")

    def add_hard_constraints(self):
        """
        Add mandatory constraints that must be satisfied
        """
        courses = self.config['courses']
        time_slots = self.config['time_slots']
        faculty = self.config['faculty']
        rooms = self.config['rooms']

        # CONSTRAINT 1: Each course must be scheduled exactly once per week (or as per requirement)
        for course in courses:
            course_vars = []
            for slot in time_slots:
                for fac in faculty:
                    for room in rooms:
                        var_name = f"c{course['id']}_s{slot['id']}_f{fac['id']}_r{room['id']}"
                        course_vars.append(self.variables[var_name])

            required_sessions = course.get('sessions_per_week', 1)
            self.model.Add(sum(course_vars) == required_sessions)

        # CONSTRAINT 2: No faculty can teach two courses at the same time
        for slot in time_slots:
            for fac in faculty:
                faculty_slot_vars = []
                for course in courses:
                    for room in rooms:
                        var_name = f"c{course['id']}_s{slot['id']}_f{fac['id']}_r{room['id']}"
                        faculty_slot_vars.append(self.variables[var_name])
                self.model.Add(sum(faculty_slot_vars) <= 1)

        # CONSTRAINT 3: No room can be used for two courses at the same time
        for slot in time_slots:
            for room in rooms:
                room_slot_vars = []
                for course in courses:
                    for fac in faculty:
                        var_name = f"c{course['id']}_s{slot['id']}_f{fac['id']}_r{room['id']}"
                        room_slot_vars.append(self.variables[var_name])
                self.model.Add(sum(room_slot_vars) <= 1)

        # CONSTRAINT 4: Faculty can only teach courses they are qualified for
        for course in courses:
            qualified_faculty_ids = course.get('qualified_faculty_ids', [])
            for slot in time_slots:
                for fac in faculty:
                    if fac['id'] not in qualified_faculty_ids:
                        for room in rooms:
                            var_name = f"c{course['id']}_s{slot['id']}_f{fac['id']}_r{room['id']}"
                            self.model.Add(self.variables[var_name] == 0)

        # CONSTRAINT 5: Room capacity must accommodate course enrollment
        for course in courses:
            enrolled_students = course.get('enrolled_students', 0)
            for slot in time_slots:
                for fac in faculty:
                    for room in rooms:
                        if room['capacity'] < enrolled_students:
                            var_name = f"c{course['id']}_s{slot['id']}_f{fac['id']}_r{room['id']}"
                            self.model.Add(self.variables[var_name] == 0)

        # CONSTRAINT 6: Labs must be scheduled in lab rooms
        for course in courses:
            if course.get('course_type') in ['PRACTICAL', 'HYBRID']:
                for slot in time_slots:
                    for fac in faculty:
                        for room in rooms:
                            if room['room_type'] != 'LAB':
                                var_name = f"c{course['id']}_s{slot['id']}_f{fac['id']}_r{room['id']}"
                                self.model.Add(self.variables[var_name] == 0)

        # CONSTRAINT 7: Faculty workload limits
        for fac in faculty:
            max_hours = fac.get('max_hours_per_week', 20)
            faculty_vars = []
            for course in courses:
                for slot in time_slots:
                    for room in rooms:
                        var_name = f"c{course['id']}_s{slot['id']}_f{fac['id']}_r{room['id']}"
                        # Multiply by course duration
                        duration = course.get('duration', 1)
                        faculty_vars.append((self.variables[var_name], duration))

            # Sum of (var * duration) <= max_hours
            total_hours = sum(var * dur for var, dur in faculty_vars)
            self.model.Add(total_hours <= max_hours)

        logger.info("Added all hard constraints")

    def add_soft_constraints(self):
        """
        Add soft constraints (preferences) with penalties
        """
        courses = self.config['courses']
        time_slots = self.config['time_slots']
        faculty = self.config['faculty']
        rooms = self.config['rooms']

        penalties = []

        # SOFT CONSTRAINT 1: Prefer morning slots for theory classes
        if self.config.get('prefer_morning_sessions', True):
            morning_slots = [s for s in time_slots if s.get('is_morning', False)]
            for course in courses:
                if course.get('course_type') == 'THEORY':
                    for slot in time_slots:
                        is_morning = slot in morning_slots
                        for fac in faculty:
                            for room in rooms:
                                var_name = f"c{course['id']}_s{slot['id']}_f{fac['id']}_r{room['id']}"
                                if not is_morning:
                                    # Add penalty for non-morning slots
                                    penalty_var = self.model.NewBoolVar(f"penalty_{var_name}")
                                    self.model.Add(penalty_var == self.variables[var_name])
                                    penalties.append((penalty_var, 10))

        # SOFT CONSTRAINT 2: Faculty preference for courses
        for course in courses:
            for fac in faculty:
                preference = course.get('faculty_preferences', {}).get(fac['id'], 3)
                penalty_weight = (5 - preference) * 5  # Higher penalty for less preferred

                for slot in time_slots:
                    for room in rooms:
                        var_name = f"c{course['id']}_s{slot['id']}_f{fac['id']}_r{room['id']}"
                        penalty_var = self.model.NewBoolVar(f"penalty_{var_name}")
                        self.model.Add(penalty_var == self.variables[var_name])
                        penalties.append((penalty_var, penalty_weight))

        # SOFT CONSTRAINT 3: Avoid back-to-back practicals
        if self.config.get('avoid_back_to_back_practicals', True):
            practical_courses = [c for c in courses if c.get('course_type') in ['PRACTICAL', 'HYBRID']]
            consecutive_slots = self._get_consecutive_slots(time_slots)

            for slot1, slot2 in consecutive_slots:
                for course in practical_courses:
                    for fac in faculty:
                        for room in rooms:
                            var1 = f"c{course['id']}_s{slot1['id']}_f{fac['id']}_r{room['id']}"
                            var2 = f"c{course['id']}_s{slot2['id']}_f{fac['id']}_r{room['id']}"

                            # If both are scheduled, add penalty
                            both_scheduled = self.model.NewBoolVar(f"both_{var1}_{var2}")
                            self.model.AddMinEquality(
                                both_scheduled,
                                [self.variables[var1], self.variables[var2]]
                            )
                            penalties.append((both_scheduled, 20))

        # Minimize total penalty
        if penalties:
            total_penalty = sum(var * weight for var, weight in penalties)
            self.model.Minimize(total_penalty)

        logger.info(f"Added {len(penalties)} soft constraint penalties")

    def _get_consecutive_slots(self, time_slots: List[Dict]) -> List[Tuple[Dict, Dict]]:
        """Get pairs of consecutive time slots"""
        consecutive = []
        slots_by_day = {}

        # Group slots by day
        for slot in time_slots:
            day = slot['day_of_week']
            if day not in slots_by_day:
                slots_by_day[day] = []
            slots_by_day[day].append(slot)

        # Find consecutive slots for each day
        for day, day_slots in slots_by_day.items():
            sorted_slots = sorted(day_slots, key=lambda s: s['slot_number'])
            for i in range(len(sorted_slots) - 1):
                consecutive.append((sorted_slots[i], sorted_slots[i + 1]))

        return consecutive

    def solve(self, time_limit_seconds: int = 300) -> Dict:
        """
        Solve the timetable optimization problem

        Args:
            time_limit_seconds: Maximum time to spend on optimization

        Returns:
            Dictionary containing solution status and schedule
        """
        start_time = datetime.now()

        # Set solver parameters
        self.solver.parameters.max_time_in_seconds = time_limit_seconds
        self.solver.parameters.log_search_progress = True
        self.solver.parameters.num_search_workers = 8  # Parallel search

        logger.info("Starting optimization...")
        status = self.solver.Solve(self.model)

        solve_time = (datetime.now() - start_time).total_seconds()

        result = {
            'status': self._get_status_string(status),
            'solve_time': solve_time,
            'objective_value': self.solver.ObjectiveValue() if status in [cp_model.OPTIMAL, cp_model.FEASIBLE] else None,
            'schedule': []
        }

        if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
            logger.info(f"Solution found! Objective value: {self.solver.ObjectiveValue()}")
            result['schedule'] = self._extract_solution()
        else:
            logger.error(f"No solution found. Status: {self._get_status_string(status)}")

        return result

    def _get_status_string(self, status: int) -> str:
        """Convert solver status code to string"""
        status_map = {
            cp_model.OPTIMAL: 'OPTIMAL',
            cp_model.FEASIBLE: 'FEASIBLE',
            cp_model.INFEASIBLE: 'INFEASIBLE',
            cp_model.MODEL_INVALID: 'MODEL_INVALID',
            cp_model.UNKNOWN: 'UNKNOWN'
        }
        return status_map.get(status, 'UNKNOWN')

    def _extract_solution(self) -> List[Dict]:
        """Extract the schedule from the solved model"""
        schedule = []

        for var_name, var in self.variables.items():
            if self.solver.Value(var) == 1:
                # Parse variable name: c{course_id}_s{slot_id}_f{faculty_id}_r{room_id}
                parts = var_name.split('_')
                course_id = int(parts[0][1:])
                slot_id = int(parts[1][1:])
                faculty_id = int(parts[2][1:])
                room_id = int(parts[3][1:])

                schedule.append({
                    'course_id': course_id,
                    'time_slot_id': slot_id,
                    'faculty_id': faculty_id,
                    'room_id': room_id
                })

        return schedule

    def generate(self) -> Dict:
        """
        Main method to generate timetable
        Orchestrates the entire optimization process
        """
        try:
            logger.info("Initializing timetable generation...")

            # Step 1: Create variables
            self.create_variables()

            # Step 2: Add constraints
            self.add_hard_constraints()
            self.add_soft_constraints()

            # Step 3: Solve
            result = self.solve()

            return result

        except Exception as e:
            logger.error(f"Error during timetable generation: {str(e)}")
            return {
                'status': 'ERROR',
                'error': str(e),
                'schedule': []
            }
