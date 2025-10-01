"""
Genetic Algorithm implementation for timetable optimization
Alternative approach to OR-Tools, useful for large-scale problems
"""
import random
from typing import List, Dict, Tuple
from deap import base, creator, tools, algorithms
import numpy as np
import logging

logger = logging.getLogger(__name__)


class GeneticTimetableOptimizer:
    """
    Genetic Algorithm-based timetable generator
    Uses DEAP (Distributed Evolutionary Algorithms in Python)
    """

    def __init__(self, timetable_config: Dict):
        self.config = timetable_config
        self.courses = timetable_config['courses']
        self.time_slots = timetable_config['time_slots']
        self.faculty = timetable_config['faculty']
        self.rooms = timetable_config['rooms']

        # Gene structure: [time_slot_idx, faculty_idx, room_idx] for each course
        self.gene_length = len(self.courses) * 3

        self._setup_ga()

    def _setup_ga(self):
        """Initialize DEAP genetic algorithm components"""
        # Create fitness and individual classes
        if not hasattr(creator, "FitnessMin"):
            creator.create("FitnessMin", base.Fitness, weights=(-1.0,))
        if not hasattr(creator, "Individual"):
            creator.create("Individual", list, fitness=creator.FitnessMin)

        self.toolbox = base.Toolbox()

        # Gene creation
        self.toolbox.register("time_slot", random.randint, 0, len(self.time_slots) - 1)
        self.toolbox.register("faculty", random.randint, 0, len(self.faculty) - 1)
        self.toolbox.register("room", random.randint, 0, len(self.rooms) - 1)

        # Individual creation
        def create_individual():
            genes = []
            for _ in range(len(self.courses)):
                genes.extend([
                    random.randint(0, len(self.time_slots) - 1),
                    random.randint(0, len(self.faculty) - 1),
                    random.randint(0, len(self.rooms) - 1)
                ])
            return creator.Individual(genes)

        self.toolbox.register("individual", create_individual)
        self.toolbox.register("population", tools.initRepeat, list, self.toolbox.individual)

        # Genetic operators
        self.toolbox.register("evaluate", self.evaluate_fitness)
        self.toolbox.register("mate", tools.cxTwoPoint)
        self.toolbox.register("mutate", self.mutate_individual, indpb=0.2)
        self.toolbox.register("select", tools.selTournament, tournsize=3)

    def decode_individual(self, individual: List[int]) -> List[Dict]:
        """
        Decode a genetic individual into a timetable schedule

        Args:
            individual: List of integers representing the schedule

        Returns:
            List of scheduled classes
        """
        schedule = []
        for i, course in enumerate(self.courses):
            gene_idx = i * 3
            time_slot_idx = individual[gene_idx]
            faculty_idx = individual[gene_idx + 1]
            room_idx = individual[gene_idx + 2]

            schedule.append({
                'course_id': course['id'],
                'course': course,
                'time_slot_id': self.time_slots[time_slot_idx]['id'],
                'time_slot': self.time_slots[time_slot_idx],
                'faculty_id': self.faculty[faculty_idx]['id'],
                'faculty': self.faculty[faculty_idx],
                'room_id': self.rooms[room_idx]['id'],
                'room': self.rooms[room_idx]
            })

        return schedule

    def evaluate_fitness(self, individual: List[int]) -> Tuple[float,]:
        """
        Evaluate fitness of an individual (lower is better)
        Penalty-based approach for constraint violations

        Returns:
            Tuple containing single fitness value
        """
        schedule = self.decode_individual(individual)
        penalty = 0

        # HARD CONSTRAINT PENALTIES (high penalty)

        # 1. Faculty conflicts (same faculty, same time slot)
        faculty_time_map = {}
        for item in schedule:
            key = (item['faculty_id'], item['time_slot_id'])
            if key in faculty_time_map:
                penalty += 1000  # High penalty for hard constraint violation
            faculty_time_map[key] = item

        # 2. Room conflicts (same room, same time slot)
        room_time_map = {}
        for item in schedule:
            key = (item['room_id'], item['time_slot_id'])
            if key in room_time_map:
                penalty += 1000
            room_time_map[key] = item

        # 3. Faculty qualification
        for item in schedule:
            qualified_faculty = item['course'].get('qualified_faculty_ids', [])
            if qualified_faculty and item['faculty_id'] not in qualified_faculty:
                penalty += 800

        # 4. Room capacity
        for item in schedule:
            enrolled = item['course'].get('enrolled_students', 0)
            capacity = item['room']['capacity']
            if enrolled > capacity:
                penalty += 500 * (enrolled - capacity)

        # 5. Room type match (labs need lab rooms)
        for item in schedule:
            if item['course'].get('course_type') in ['PRACTICAL', 'HYBRID']:
                if item['room']['room_type'] != 'LAB':
                    penalty += 600

        # 6. Faculty workload
        faculty_hours = {}
        for item in schedule:
            fac_id = item['faculty_id']
            duration = item['course'].get('duration', 1)
            faculty_hours[fac_id] = faculty_hours.get(fac_id, 0) + duration

        for fac in self.faculty:
            max_hours = fac.get('max_hours_per_week', 20)
            actual_hours = faculty_hours.get(fac['id'], 0)
            if actual_hours > max_hours:
                penalty += 300 * (actual_hours - max_hours)

        # SOFT CONSTRAINT PENALTIES (lower penalty)

        # 1. Morning preference for theory classes
        if self.config.get('prefer_morning_sessions', True):
            for item in schedule:
                if item['course'].get('course_type') == 'THEORY':
                    if not item['time_slot'].get('is_morning', False):
                        penalty += 10

        # 2. Faculty preference
        for item in schedule:
            preferences = item['course'].get('faculty_preferences', {})
            preference_level = preferences.get(item['faculty_id'], 3)
            penalty += (5 - preference_level) * 5

        # 3. Avoid back-to-back practicals
        if self.config.get('avoid_back_to_back_practicals', True):
            schedule_by_day_fac = {}
            for item in schedule:
                if item['course'].get('course_type') in ['PRACTICAL', 'HYBRID']:
                    key = (item['time_slot']['day_of_week'], item['faculty_id'])
                    if key not in schedule_by_day_fac:
                        schedule_by_day_fac[key] = []
                    schedule_by_day_fac[key].append(item)

            for items in schedule_by_day_fac.values():
                sorted_items = sorted(items, key=lambda x: x['time_slot']['slot_number'])
                for i in range(len(sorted_items) - 1):
                    if sorted_items[i + 1]['time_slot']['slot_number'] - sorted_items[i]['time_slot']['slot_number'] == 1:
                        penalty += 20

        # 4. Balanced daily distribution
        max_per_day = self.config.get('max_lectures_per_day', 6)
        courses_by_day = {}
        for item in schedule:
            day = item['time_slot']['day_of_week']
            courses_by_day[day] = courses_by_day.get(day, 0) + 1

        for count in courses_by_day.values():
            if count > max_per_day:
                penalty += 50 * (count - max_per_day)

        return (penalty,)

    def mutate_individual(self, individual: List[int], indpb: float) -> Tuple[List[int],]:
        """
        Mutate an individual by randomly changing genes

        Args:
            individual: The individual to mutate
            indpb: Probability of mutating each gene

        Returns:
            Tuple containing the mutated individual
        """
        for i in range(len(individual)):
            if random.random() < indpb:
                gene_type = i % 3
                if gene_type == 0:  # time slot
                    individual[i] = random.randint(0, len(self.time_slots) - 1)
                elif gene_type == 1:  # faculty
                    individual[i] = random.randint(0, len(self.faculty) - 1)
                else:  # room
                    individual[i] = random.randint(0, len(self.rooms) - 1)

        return (individual,)

    def generate(
        self,
        population_size: int = 300,
        generations: int = 100,
        crossover_prob: float = 0.7,
        mutation_prob: float = 0.2
    ) -> Dict:
        """
        Generate timetable using genetic algorithm

        Args:
            population_size: Number of individuals in population
            generations: Number of generations to evolve
            crossover_prob: Probability of crossover
            mutation_prob: Probability of mutation

        Returns:
            Dictionary with solution status and schedule
        """
        logger.info(f"Starting GA optimization with pop={population_size}, gen={generations}")

        # Create initial population
        population = self.toolbox.population(n=population_size)

        # Statistics
        stats = tools.Statistics(lambda ind: ind.fitness.values)
        stats.register("avg", np.mean)
        stats.register("min", np.min)
        stats.register("max", np.max)

        # Hall of Fame to keep best individuals
        hof = tools.HallOfFame(1)

        # Run evolution
        population, logbook = algorithms.eaSimple(
            population,
            self.toolbox,
            cxpb=crossover_prob,
            mutpb=mutation_prob,
            ngen=generations,
            stats=stats,
            halloffame=hof,
            verbose=True
        )

        # Get best solution
        best_individual = hof[0]
        best_fitness = best_individual.fitness.values[0]

        logger.info(f"Best fitness: {best_fitness}")

        schedule = self.decode_individual(best_individual)

        return {
            'status': 'FEASIBLE' if best_fitness < 1000 else 'SUBOPTIMAL',
            'objective_value': best_fitness,
            'schedule': schedule,
            'statistics': {
                'generations': generations,
                'population_size': population_size,
                'final_avg_fitness': logbook[-1]['avg'],
                'final_min_fitness': logbook[-1]['min']
            }
        }
