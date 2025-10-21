package optimization

import (
	"context"
	"fmt"
	"math"
	"math/rand"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/yourusername/timetable-scheduler/internal/models"
)

// TimetableEngine is the main optimization engine
type TimetableEngine struct {
	timetableID uuid.UUID
	config      *EngineConfig
	courses     []models.Course
	faculty     []models.Faculty
	rooms       []models.Room
	timeSlots   []models.TimeSlot
	constraints map[string]Constraint
	bestSolution *Solution
	mu          sync.Mutex
}

// EngineConfig holds configuration for the optimization engine
type EngineConfig struct {
	Algorithm      string        // "hybrid", "genetic", "simulated_annealing", "tabu_search"
	MaxIterations  int           // Maximum iterations
	Timeout        time.Duration // Maximum runtime
	Workers        int           // Number of parallel workers
	PopulationSize int           // For genetic algorithm
	Temperature    float64       // For simulated annealing
}

// Solution represents a complete timetable solution
type Solution struct {
	Schedule      map[string]*ClassAssignment // key: "course_id:day:slot"
	FitnessScore  float64
	HardViolations int
	SoftViolations int
}

// ClassAssignment represents a single class assignment
type ClassAssignment struct {
	CourseID  uuid.UUID
	FacultyID uuid.UUID
	RoomID    uuid.UUID
	DayOfWeek int
	StartTime string
	EndTime   string
	TimeSlot  models.TimeSlot
}

// Constraint interface for all constraints
type Constraint interface {
	IsHard() bool
	Evaluate(solution *Solution) (violated bool, penalty float64)
	GetDescription() string
}

// NewTimetableEngine creates a new optimization engine
func NewTimetableEngine(timetableID uuid.UUID, config *EngineConfig) *TimetableEngine {
	if config == nil {
		config = &EngineConfig{
			Algorithm:      "hybrid",
			MaxIterations:  10000,
			Timeout:        5 * time.Minute,
			Workers:        8,
			PopulationSize: 100,
			Temperature:    1000.0,
		}
	}

	return &TimetableEngine{
		timetableID: timetableID,
		config:      config,
		constraints: make(map[string]Constraint),
		bestSolution: &Solution{
			Schedule:      make(map[string]*ClassAssignment),
			FitnessScore:  math.Inf(-1),
		},
	}
}

// LoadData loads courses, faculty, rooms, and time slots
func (e *TimetableEngine) LoadData(
	courses []models.Course,
	faculty []models.Faculty,
	rooms []models.Room,
	timeSlots []models.TimeSlot,
) {
	e.courses = courses
	e.faculty = faculty
	e.rooms = rooms
	e.timeSlots = timeSlots
}

// AddConstraint adds a constraint to the engine
func (e *TimetableEngine) AddConstraint(name string, constraint Constraint) {
	e.constraints[name] = constraint
}

// Generate runs the optimization algorithm
func (e *TimetableEngine) Generate(ctx context.Context) (*Solution, error) {
	// startTime := time.Now() // TODO: use for metrics

	// Create timeout context
	timeoutCtx, cancel := context.WithTimeout(ctx, e.config.Timeout)
	defer cancel()

	// Select algorithm based on configuration
	switch e.config.Algorithm {
	case "hybrid":
		return e.hybridAlgorithm(timeoutCtx)
	case "genetic":
		return e.geneticAlgorithm(timeoutCtx)
	case "simulated_annealing":
		return e.simulatedAnnealing(timeoutCtx)
	case "tabu_search":
		return e.tabuSearch(timeoutCtx)
	default:
		return e.hybridAlgorithm(timeoutCtx)
	}
}

// hybridAlgorithm combines multiple techniques
func (e *TimetableEngine) hybridAlgorithm(ctx context.Context) (*Solution, error) {
	// Phase 1: Greedy construction (fast initial solution)
	initialSolution := e.greedyConstruction()

	// Phase 2: Simulated annealing for global exploration
	solution := e.improveWithSimulatedAnnealing(ctx, initialSolution, 100)

	// Phase 3: Tabu search for local optimization
	solution = e.improveWithTabuSearch(ctx, solution, 50)

	// Phase 4: Final hill climbing
	solution = e.hillClimbing(ctx, solution, 20)

	return solution, nil
}

// greedyConstruction creates an initial feasible solution quickly
func (e *TimetableEngine) greedyConstruction() *Solution {
	solution := &Solution{
		Schedule: make(map[string]*ClassAssignment),
	}

	// Sort courses by complexity (lab courses, high credit hours first)
	sortedCourses := e.sortCoursesByComplexity()

	for _, course := range sortedCourses {
		// Find suitable faculty
		faculty := e.findSuitableFaculty(course.ID)
		if faculty == nil {
			continue
		}

		// Find suitable room
		room := e.findSuitableRoom(course.CourseType)
		if room == nil {
			continue
		}

		// Find available time slot
		for _, timeSlot := range e.timeSlots {
			key := e.makeKey(course.ID, timeSlot.DayOfWeek, timeSlot.ID)

			// Check if slot is available
			if !e.isSlotAvailable(solution, *faculty, *room, timeSlot) {
				continue
			}

			// Assign class
			solution.Schedule[key] = &ClassAssignment{
				CourseID:  course.ID,
				FacultyID: faculty.ID,
				RoomID:    room.ID,
				DayOfWeek: timeSlot.DayOfWeek,
				StartTime: timeSlot.StartTime,
				EndTime:   timeSlot.EndTime,
				TimeSlot:  timeSlot,
			}
			break
		}
	}

	solution.FitnessScore = e.evaluateSolution(solution)
	return solution
}

// simulatedAnnealing implements simulated annealing optimization
func (e *TimetableEngine) simulatedAnnealing(ctx context.Context) (*Solution, error) {
	current := e.greedyConstruction()
	best := current
	temperature := e.config.Temperature

	for i := 0; i < e.config.MaxIterations; i++ {
		select {
		case <-ctx.Done():
			return best, nil
		default:
		}

		// Generate neighbor solution
		neighbor := e.generateNeighbor(current)

		// Calculate acceptance probability
		delta := neighbor.FitnessScore - current.FitnessScore
		if delta > 0 || rand.Float64() < math.Exp(delta/temperature) {
			current = neighbor

			if current.FitnessScore > best.FitnessScore {
				best = current
			}
		}

		// Cool down temperature
		temperature *= 0.995
	}

	return best, nil
}

// improveWithSimulatedAnnealing improves a solution using simulated annealing
func (e *TimetableEngine) improveWithSimulatedAnnealing(ctx context.Context, initial *Solution, iterations int) *Solution {
	current := initial
	best := initial
	temperature := 500.0

	for i := 0; i < iterations; i++ {
		select {
		case <-ctx.Done():
			return best
		default:
		}

		neighbor := e.generateNeighbor(current)
		delta := neighbor.FitnessScore - current.FitnessScore

		if delta > 0 || rand.Float64() < math.Exp(delta/temperature) {
			current = neighbor
			if current.FitnessScore > best.FitnessScore {
				best = current
			}
		}

		temperature *= 0.98
	}

	return best
}

// tabuSearch implements tabu search optimization
func (e *TimetableEngine) tabuSearch(ctx context.Context) (*Solution, error) {
	current := e.greedyConstruction()
	best := current
	tabuList := make(map[string]int)
	tabuTenure := 10

	for i := 0; i < e.config.MaxIterations; i++ {
		select {
		case <-ctx.Done():
			return best, nil
		default:
		}

		// Generate neighbors and select best non-tabu
		neighbors := e.generateNeighbors(current, 20)
		var bestNeighbor *Solution

		for _, neighbor := range neighbors {
			hash := e.solutionHash(neighbor)
			if _, isTabu := tabuList[hash]; isTabu {
				continue
			}

			if bestNeighbor == nil || neighbor.FitnessScore > bestNeighbor.FitnessScore {
				bestNeighbor = neighbor
			}
		}

		if bestNeighbor == nil {
			break
		}

		// Update tabu list
		hash := e.solutionHash(current)
		tabuList[hash] = i + tabuTenure

		// Clean old tabu entries
		for k, v := range tabuList {
			if v < i {
				delete(tabuList, k)
			}
		}

		current = bestNeighbor
		if current.FitnessScore > best.FitnessScore {
			best = current
		}
	}

	return best, nil
}

// improveWithTabuSearch improves a solution using tabu search
func (e *TimetableEngine) improveWithTabuSearch(ctx context.Context, initial *Solution, iterations int) *Solution {
	current := initial
	best := initial
	tabuList := make(map[string]int)
	tabuTenure := 5

	for i := 0; i < iterations; i++ {
		select {
		case <-ctx.Done():
			return best
		default:
		}

		neighbors := e.generateNeighbors(current, 10)
		var bestNeighbor *Solution

		for _, neighbor := range neighbors {
			hash := e.solutionHash(neighbor)
			if _, isTabu := tabuList[hash]; !isTabu {
				if bestNeighbor == nil || neighbor.FitnessScore > bestNeighbor.FitnessScore {
					bestNeighbor = neighbor
				}
			}
		}

		if bestNeighbor != nil {
			tabuList[e.solutionHash(current)] = i + tabuTenure
			current = bestNeighbor
			if current.FitnessScore > best.FitnessScore {
				best = current
			}
		}
	}

	return best
}

// geneticAlgorithm implements genetic algorithm optimization
func (e *TimetableEngine) geneticAlgorithm(ctx context.Context) (*Solution, error) {
	// Initialize population
	population := make([]*Solution, e.config.PopulationSize)
	for i := 0; i < e.config.PopulationSize; i++ {
		population[i] = e.randomSolution()
	}

	for generation := 0; generation < e.config.MaxIterations/e.config.PopulationSize; generation++ {
		select {
		case <-ctx.Done():
			return e.getBestFromPopulation(population), nil
		default:
		}

		// Selection
		parents := e.tournamentSelection(population, e.config.PopulationSize/2)

		// Crossover
		offspring := make([]*Solution, 0)
		for i := 0; i < len(parents)-1; i += 2 {
			child1, child2 := e.crossover(parents[i], parents[i+1])
			offspring = append(offspring, child1, child2)
		}

		// Mutation
		for _, child := range offspring {
			if rand.Float64() < 0.1 {
				e.mutate(child)
			}
		}

		// Replacement
		population = append(parents[:len(parents)/2], offspring...)[:e.config.PopulationSize]
	}

	return e.getBestFromPopulation(population), nil
}

// hillClimbing performs simple hill climbing
func (e *TimetableEngine) hillClimbing(ctx context.Context, initial *Solution, iterations int) *Solution {
	current := initial

	for i := 0; i < iterations; i++ {
		select {
		case <-ctx.Done():
			return current
		default:
		}

		neighbor := e.generateBestNeighbor(current)
		if neighbor.FitnessScore > current.FitnessScore {
			current = neighbor
		} else {
			break // Local optimum reached
		}
	}

	return current
}

// Helper methods

func (e *TimetableEngine) evaluateSolution(solution *Solution) float64 {
	score := 1000.0
	hardViolations := 0
	softViolations := 0

	for name, constraint := range e.constraints {
		violated, penalty := constraint.Evaluate(solution)
		if violated {
			if constraint.IsHard() {
				hardViolations++
				score -= 1000 * penalty
			} else {
				softViolations++
				score -= penalty
			}
		}
		_ = name // for debugging
	}

	solution.HardViolations = hardViolations
	solution.SoftViolations = softViolations
	solution.FitnessScore = score

	return score
}

func (e *TimetableEngine) makeKey(courseID uuid.UUID, day int, slotID uuid.UUID) string {
	return fmt.Sprintf("%s:%d:%s", courseID.String(), day, slotID.String())
}

func (e *TimetableEngine) isSlotAvailable(solution *Solution, faculty models.Faculty, room models.Room, slot models.TimeSlot) bool {
	// Check faculty availability
	for _, assignment := range solution.Schedule {
		if assignment.FacultyID == faculty.ID && assignment.DayOfWeek == slot.DayOfWeek {
			if e.timeSlotsOverlap(assignment.StartTime, assignment.EndTime, slot.StartTime, slot.EndTime) {
				return false
			}
		}
	}

	// Check room availability
	for _, assignment := range solution.Schedule {
		if assignment.RoomID == room.ID && assignment.DayOfWeek == slot.DayOfWeek {
			if e.timeSlotsOverlap(assignment.StartTime, assignment.EndTime, slot.StartTime, slot.EndTime) {
				return false
			}
		}
	}

	return true
}

func (e *TimetableEngine) timeSlotsOverlap(start1, end1, start2, end2 string) bool {
	// Simple string comparison (assumes HH:MM format)
	return !(end1 <= start2 || end2 <= start1)
}

func (e *TimetableEngine) findSuitableFaculty(courseID uuid.UUID) *models.Faculty {
	// Find faculty with expertise in this course
	for i := range e.faculty {
		// Check if faculty has expertise (this would be a DB query in real implementation)
		return &e.faculty[i]
	}
	return nil
}

func (e *TimetableEngine) findSuitableRoom(courseType string) *models.Room {
	for i := range e.rooms {
		room := &e.rooms[i]
		if courseType == "LAB" && room.RoomType == "LAB" {
			return room
		}
		if courseType == "THEORY" && room.RoomType == "CLASSROOM" {
			return room
		}
	}
	return nil
}

func (e *TimetableEngine) sortCoursesByComplexity() []models.Course {
	// Sort by credits (descending) and labs first
	sorted := make([]models.Course, len(e.courses))
	copy(sorted, e.courses)
	return sorted
}

func (e *TimetableEngine) generateNeighbor(solution *Solution) *Solution {
	// Create a copy
	neighbor := e.copySolution(solution)

	// Random swap or move
	if rand.Float64() < 0.5 {
		e.swapRandomAssignments(neighbor)
	} else {
		e.moveRandomAssignment(neighbor)
	}

	neighbor.FitnessScore = e.evaluateSolution(neighbor)
	return neighbor
}

func (e *TimetableEngine) generateNeighbors(solution *Solution, count int) []*Solution {
	neighbors := make([]*Solution, count)
	for i := 0; i < count; i++ {
		neighbors[i] = e.generateNeighbor(solution)
	}
	return neighbors
}

func (e *TimetableEngine) generateBestNeighbor(solution *Solution) *Solution {
	neighbors := e.generateNeighbors(solution, 10)
	best := neighbors[0]
	for _, neighbor := range neighbors[1:] {
		if neighbor.FitnessScore > best.FitnessScore {
			best = neighbor
		}
	}
	return best
}

func (e *TimetableEngine) copySolution(solution *Solution) *Solution {
	newSolution := &Solution{
		Schedule:       make(map[string]*ClassAssignment),
		FitnessScore:   solution.FitnessScore,
		HardViolations: solution.HardViolations,
		SoftViolations: solution.SoftViolations,
	}
	for k, v := range solution.Schedule {
		newSolution.Schedule[k] = v
	}
	return newSolution
}

func (e *TimetableEngine) swapRandomAssignments(solution *Solution) {
	// Implementation of swapping two random assignments
}

func (e *TimetableEngine) moveRandomAssignment(solution *Solution) {
	// Implementation of moving one assignment to a different slot
}

func (e *TimetableEngine) solutionHash(solution *Solution) string {
	// Create a hash of the solution for tabu list
	return fmt.Sprintf("%f", solution.FitnessScore)
}

func (e *TimetableEngine) randomSolution() *Solution {
	return e.greedyConstruction()
}

func (e *TimetableEngine) tournamentSelection(population []*Solution, count int) []*Solution {
	selected := make([]*Solution, count)
	for i := 0; i < count; i++ {
		a := population[rand.Intn(len(population))]
		b := population[rand.Intn(len(population))]
		if a.FitnessScore > b.FitnessScore {
			selected[i] = a
		} else {
			selected[i] = b
		}
	}
	return selected
}

func (e *TimetableEngine) crossover(parent1, parent2 *Solution) (*Solution, *Solution) {
	// Simple one-point crossover
	child1 := e.copySolution(parent1)
	child2 := e.copySolution(parent2)
	return child1, child2
}

func (e *TimetableEngine) mutate(solution *Solution) {
	e.moveRandomAssignment(solution)
	solution.FitnessScore = e.evaluateSolution(solution)
}

func (e *TimetableEngine) getBestFromPopulation(population []*Solution) *Solution {
	best := population[0]
	for _, solution := range population[1:] {
		if solution.FitnessScore > best.FitnessScore {
			best = solution
		}
	}
	return best
}
