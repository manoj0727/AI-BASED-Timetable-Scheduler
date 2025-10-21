package handlers

import (
	"context"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/yourusername/timetable-scheduler/internal/database"
	"github.com/yourusername/timetable-scheduler/internal/models"
	"github.com/yourusername/timetable-scheduler/internal/optimization"
)

// GetTimetables retrieves all timetables
func GetTimetables(c *fiber.Ctx) error {
	var timetables []models.TimetableTemplate

	result := database.DB.Preload("Semester").Preload("Program").Order("created_at DESC").Find(&timetables)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch timetables",
		})
	}

	return c.JSON(fiber.Map{
		"data":  timetables,
		"count": len(timetables),
	})
}

// GetTimetable retrieves a single timetable by ID
func GetTimetable(c *fiber.Ctx) error {
	id := c.Params("id")

	timetableID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var timetable models.TimetableTemplate
	result := database.DB.
		Preload("Semester").
		Preload("Program").
		Preload("ScheduledClasses").
		Preload("ScheduledClasses.Course").
		Preload("ScheduledClasses.Faculty").
		Preload("ScheduledClasses.Room").
		Preload("TimeSlots").
		Preload("ConflictLogs").
		First(&timetable, timetableID)

	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Timetable not found",
		})
	}

	return c.JSON(fiber.Map{
		"data": timetable,
	})
}

// CreateTimetable creates a new timetable template
func CreateTimetable(c *fiber.Ctx) error {
	var timetable models.TimetableTemplate

	if err := c.BodyParser(&timetable); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validation
	if timetable.Name == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Name is required",
		})
	}

	if timetable.SemesterID == uuid.Nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Semester ID is required",
		})
	}

	// Set default status
	timetable.Status = "DRAFT"
	timetable.IsPublished = false

	result := database.DB.Create(&timetable)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create timetable",
		})
	}

	// Create default time slots (Monday-Friday, 9 AM - 5 PM)
	createDefaultTimeSlots(timetable.ID)

	return c.Status(201).JSON(fiber.Map{
		"message": "Timetable created successfully",
		"data":    timetable,
	})
}

// UpdateTimetable updates an existing timetable
func UpdateTimetable(c *fiber.Ctx) error {
	id := c.Params("id")

	timetableID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var timetable models.TimetableTemplate
	if err := database.DB.First(&timetable, timetableID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Timetable not found",
		})
	}

	if err := c.BodyParser(&timetable); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := database.DB.Save(&timetable).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update timetable",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Timetable updated successfully",
		"data":    timetable,
	})
}

// DeleteTimetable deletes a timetable
func DeleteTimetable(c *fiber.Ctx) error {
	id := c.Params("id")

	timetableID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	result := database.DB.Delete(&models.TimetableTemplate{}, timetableID)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete timetable",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Timetable deleted successfully",
	})
}

// GetScheduledClasses retrieves all scheduled classes for a timetable
func GetScheduledClasses(c *fiber.Ctx) error {
	id := c.Params("id")

	timetableID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var classes []models.ScheduledClass
	result := database.DB.
		Where("timetable_id = ?", timetableID).
		Preload("Course").
		Preload("Faculty").
		Preload("Room").
		Preload("TimeSlot").
		Order("day_of_week, start_time").
		Find(&classes)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch scheduled classes",
		})
	}

	return c.JSON(fiber.Map{
		"data":  classes,
		"count": len(classes),
	})
}

// AddScheduledClass adds a new scheduled class with conflict detection
func AddScheduledClass(c *fiber.Ctx) error {
	id := c.Params("id")

	timetableID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var class models.ScheduledClass
	if err := c.BodyParser(&class); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	class.TimetableID = timetableID

	// Check for conflicts
	conflicts := detectConflicts(&class)
	if len(conflicts) > 0 {
		return c.Status(409).JSON(fiber.Map{
			"error":     "Scheduling conflicts detected",
			"conflicts": conflicts,
		})
	}

	result := database.DB.Create(&class)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create scheduled class",
		})
	}

	// Load relations
	database.DB.
		Preload("Course").
		Preload("Faculty").
		Preload("Room").
		First(&class, class.ID)

	return c.Status(201).JSON(fiber.Map{
		"message": "Scheduled class added successfully",
		"data":    class,
	})
}

// UpdateScheduledClass updates a scheduled class
func UpdateScheduledClass(c *fiber.Ctx) error {
	classID := c.Params("classId")

	id, err := uuid.Parse(classID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var class models.ScheduledClass
	if err := database.DB.First(&class, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Scheduled class not found",
		})
	}

	var updates models.ScheduledClass
	if err := c.BodyParser(&updates); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Update fields
	class.CourseID = updates.CourseID
	class.FacultyID = updates.FacultyID
	class.RoomID = updates.RoomID
	class.DayOfWeek = updates.DayOfWeek
	class.StartTime = updates.StartTime
	class.EndTime = updates.EndTime

	// Check for conflicts
	conflicts := detectConflicts(&class)
	if len(conflicts) > 0 {
		return c.Status(409).JSON(fiber.Map{
			"error":     "Scheduling conflicts detected",
			"conflicts": conflicts,
		})
	}

	if err := database.DB.Save(&class).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update scheduled class",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Scheduled class updated successfully",
		"data":    class,
	})
}

// DeleteScheduledClass deletes a scheduled class
func DeleteScheduledClass(c *fiber.Ctx) error {
	classID := c.Params("classId")

	id, err := uuid.Parse(classID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	result := database.DB.Delete(&models.ScheduledClass{}, id)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete scheduled class",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Scheduled class deleted successfully",
	})
}

// GenerateTimetable generates timetable using AI optimization
func GenerateTimetable(c *fiber.Ctx) error {
	id := c.Params("id")

	timetableID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var timetable models.TimetableTemplate
	if err := database.DB.First(&timetable, timetableID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Timetable not found",
		})
	}

	// Update status
	timetable.Status = "GENERATING"
	timetable.GenerationStartTime = timePtr(time.Now())
	database.DB.Save(&timetable)

	// Get all required data
	var courses []models.Course
	var faculty []models.Faculty
	var rooms []models.Room
	var timeSlots []models.TimeSlot

	database.DB.Where("is_active = ?", true).Find(&courses)
	database.DB.Where("is_active = ?", true).Preload("Availability").Preload("CourseExpertise").Find(&faculty)
	database.DB.Where("is_available = ?", true).Find(&rooms)
	database.DB.Where("timetable_id = ?", timetableID).Find(&timeSlots)

	// Create optimization engine
	engine := optimization.NewTimetableEngine(timetableID, &optimization.EngineConfig{
		Algorithm:      "hybrid",
		MaxIterations:  10000,
		Timeout:        5 * time.Minute,
		Workers:        8,
		PopulationSize: 100,
		Temperature:    1000.0,
	})

	// Load data
	engine.LoadData(courses, faculty, rooms, timeSlots)

	// Add constraints
	addOptimizationConstraints(engine, faculty, rooms, courses)

	// Generate timetable
	ctx := context.Background()
	solution, err := engine.Generate(ctx)
	if err != nil {
		timetable.Status = "DRAFT"
		database.DB.Save(&timetable)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to generate timetable: " + err.Error(),
		})
	}

	// Save solution to database
	err = saveSolutionToDatabase(timetableID, solution)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to save generated timetable",
		})
	}

	// Update timetable status
	timetable.Status = "GENERATED"
	timetable.GenerationEndTime = timePtr(time.Now())
	timetable.AlgorithmUsed = strPtr("hybrid")
	database.DB.Save(&timetable)

	return c.JSON(fiber.Map{
		"message": "Timetable generated successfully",
		"data": fiber.Map{
			"hard_violations": solution.HardViolations,
			"soft_violations": solution.SoftViolations,
			"fitness_score":   solution.FitnessScore,
			"classes_scheduled": len(solution.Schedule),
		},
	})
}

// GetConflicts retrieves all conflicts for a timetable
func GetConflicts(c *fiber.Ctx) error {
	id := c.Params("id")

	timetableID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var conflicts []models.ConflictLog
	result := database.DB.
		Where("timetable_id = ? AND is_resolved = ?", timetableID, false).
		Order("severity DESC, created_at DESC").
		Find(&conflicts)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch conflicts",
		})
	}

	return c.JSON(fiber.Map{
		"data":  conflicts,
		"count": len(conflicts),
	})
}

// CheckConflicts checks for conflicts in a proposed schedule
func CheckConflicts(c *fiber.Ctx) error {
	var class models.ScheduledClass
	if err := c.BodyParser(&class); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	conflicts := detectConflicts(&class)

	return c.JSON(fiber.Map{
		"has_conflicts": len(conflicts) > 0,
		"conflicts":     conflicts,
		"count":         len(conflicts),
	})
}

// PublishTimetable publishes a timetable
func PublishTimetable(c *fiber.Ctx) error {
	id := c.Params("id")

	timetableID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var timetable models.TimetableTemplate
	if err := database.DB.First(&timetable, timetableID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Timetable not found",
		})
	}

	// Check if there are any unresolved conflicts
	var conflictCount int64
	database.DB.Model(&models.ConflictLog{}).
		Where("timetable_id = ? AND is_resolved = ?", timetableID, false).
		Count(&conflictCount)

	if conflictCount > 0 {
		return c.Status(400).JSON(fiber.Map{
			"error": fmt.Sprintf("Cannot publish timetable with %d unresolved conflicts", conflictCount),
		})
	}

	timetable.Status = "PUBLISHED"
	timetable.IsPublished = true
	timetable.PublishedAt = timePtr(time.Now())

	if err := database.DB.Save(&timetable).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to publish timetable",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Timetable published successfully",
		"data":    timetable,
	})
}

// Helper functions

func createDefaultTimeSlots(timetableID uuid.UUID) {
	timeSlots := []models.TimeSlot{}

	// Monday to Friday
	for day := 1; day <= 5; day++ {
		// 9 AM - 10 AM
		timeSlots = append(timeSlots, models.TimeSlot{
			TimetableID: timetableID,
			DayOfWeek:   day,
			StartTime:   "09:00",
			EndTime:     "10:00",
			SlotType:    "REGULAR",
		})
		// 10 AM - 11 AM
		timeSlots = append(timeSlots, models.TimeSlot{
			TimetableID: timetableID,
			DayOfWeek:   day,
			StartTime:   "10:00",
			EndTime:     "11:00",
			SlotType:    "REGULAR",
		})
		// 11 AM - 12 PM
		timeSlots = append(timeSlots, models.TimeSlot{
			TimetableID: timetableID,
			DayOfWeek:   day,
			StartTime:   "11:00",
			EndTime:     "12:00",
			SlotType:    "REGULAR",
		})
		// 12 PM - 1 PM (Lunch)
		timeSlots = append(timeSlots, models.TimeSlot{
			TimetableID: timetableID,
			DayOfWeek:   day,
			StartTime:   "12:00",
			EndTime:     "13:00",
			SlotType:    "LUNCH",
		})
		// 1 PM - 2 PM
		timeSlots = append(timeSlots, models.TimeSlot{
			TimetableID: timetableID,
			DayOfWeek:   day,
			StartTime:   "13:00",
			EndTime:     "14:00",
			SlotType:    "REGULAR",
		})
		// 2 PM - 3 PM
		timeSlots = append(timeSlots, models.TimeSlot{
			TimetableID: timetableID,
			DayOfWeek:   day,
			StartTime:   "14:00",
			EndTime:     "15:00",
			SlotType:    "REGULAR",
		})
		// 3 PM - 4 PM
		timeSlots = append(timeSlots, models.TimeSlot{
			TimetableID: timetableID,
			DayOfWeek:   day,
			StartTime:   "15:00",
			EndTime:     "16:00",
			SlotType:    "REGULAR",
		})
		// 4 PM - 5 PM
		timeSlots = append(timeSlots, models.TimeSlot{
			TimetableID: timetableID,
			DayOfWeek:   day,
			StartTime:   "16:00",
			EndTime:     "17:00",
			SlotType:    "REGULAR",
		})
	}

	database.DB.Create(&timeSlots)
}

type Conflict struct {
	Type        string `json:"type"`
	Description string `json:"description"`
	Severity    string `json:"severity"`
}

func detectConflicts(class *models.ScheduledClass) []Conflict {
	conflicts := []Conflict{}

	// Check faculty double-booking
	if class.FacultyID != nil {
		var count int64
		database.DB.Model(&models.ScheduledClass{}).
			Where("faculty_id = ? AND day_of_week = ? AND id != ?", class.FacultyID, class.DayOfWeek, class.ID).
			Where("(start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?)",
				class.EndTime, class.StartTime, class.StartTime, class.StartTime).
			Count(&count)

		if count > 0 {
			conflicts = append(conflicts, Conflict{
				Type:        "FACULTY_DOUBLE_BOOKING",
				Description: "Faculty is already assigned to another class at this time",
				Severity:    "CRITICAL",
			})
		}
	}

	// Check room double-booking
	if class.RoomID != nil {
		var count int64
		database.DB.Model(&models.ScheduledClass{}).
			Where("room_id = ? AND day_of_week = ? AND id != ?", class.RoomID, class.DayOfWeek, class.ID).
			Where("(start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?)",
				class.EndTime, class.StartTime, class.StartTime, class.StartTime).
			Count(&count)

		if count > 0 {
			conflicts = append(conflicts, Conflict{
				Type:        "ROOM_DOUBLE_BOOKING",
				Description: "Room is already booked for another class at this time",
				Severity:    "CRITICAL",
			})
		}
	}

	return conflicts
}

func addOptimizationConstraints(engine *optimization.TimetableEngine, faculty []models.Faculty, rooms []models.Room, courses []models.Course) {
	// Add hard constraints
	engine.AddConstraint("no_faculty_double_booking", &optimization.NoFacultyDoubleBooking{})
	engine.AddConstraint("no_room_double_booking", &optimization.NoRoomDoubleBooking{})

	// Add soft constraints
	engine.AddConstraint("prefer_morning_theory", &optimization.PreferMorningForTheory{
		TheoryCourses: getTheoryCourseIDs(courses),
	})
}

func getTheoryCourseIDs(courses []models.Course) []string {
	ids := []string{}
	for _, course := range courses {
		if course.CourseType == "THEORY" {
			ids = append(ids, course.ID.String())
		}
	}
	return ids
}

func saveSolutionToDatabase(timetableID uuid.UUID, solution *optimization.Solution) error {
	// Clear existing scheduled classes
	database.DB.Where("timetable_id = ?", timetableID).Delete(&models.ScheduledClass{})

	// Save new schedule
	for _, assignment := range solution.Schedule {
		class := models.ScheduledClass{
			TimetableID: timetableID,
			CourseID:    assignment.CourseID,
			FacultyID:   &assignment.FacultyID,
			RoomID:      &assignment.RoomID,
			DayOfWeek:   assignment.DayOfWeek,
			StartTime:   assignment.StartTime,
			EndTime:     assignment.EndTime,
			TimeSlotID:  assignment.TimeSlot.ID,
		}

		if err := database.DB.Create(&class).Error; err != nil {
			return err
		}
	}

	return nil
}

func timePtr(t time.Time) *time.Time {
	return &t
}

func strPtr(s string) *string {
	return &s
}
