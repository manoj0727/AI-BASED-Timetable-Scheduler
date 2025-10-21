package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/yourusername/timetable-scheduler/internal/config"
)

// SetupRoutes initializes all API routes
func SetupRoutes(api fiber.Router, cfg *config.Config) {
	// Room routes (classrooms and labs)
	rooms := api.Group("/rooms")
	{
		rooms.Get("/", GetRooms)
		rooms.Post("/", CreateRoom)
		rooms.Get("/:id", GetRoom)
		rooms.Put("/:id", UpdateRoom)
		rooms.Delete("/:id", DeleteRoom)
	}

	// Timetable routes
	timetables := api.Group("/timetables")
	{
		timetables.Get("/", GetTimetables)
		timetables.Post("/", CreateTimetable)
		timetables.Get("/:id", GetTimetable)
		timetables.Put("/:id", UpdateTimetable)
		timetables.Delete("/:id", DeleteTimetable)

		// Timetable generation
		timetables.Post("/:id/generate", GenerateTimetable)
		timetables.Post("/:id/publish", PublishTimetable)

		// Scheduled classes
		timetables.Get("/:id/classes", GetScheduledClasses)
		timetables.Post("/:id/classes", AddScheduledClass)
		timetables.Put("/classes/:classId", UpdateScheduledClass)
		timetables.Delete("/classes/:classId", DeleteScheduledClass)

		// Conflicts
		timetables.Get("/:id/conflicts", GetConflicts)
		timetables.Post("/check-conflicts", CheckConflicts)
	}
}
