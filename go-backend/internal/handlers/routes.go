package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/yourusername/timetable-scheduler/internal/config"
)

// SetupRoutes initializes all API routes
func SetupRoutes(api fiber.Router, cfg *config.Config) {
	// Academic routes
	academic := api.Group("/academic")
	{
		academic.Get("/years", GetAcademicYears)
		academic.Post("/years", CreateAcademicYear)
		academic.Get("/years/:id", GetAcademicYear)
		academic.Put("/years/:id", UpdateAcademicYear)
		academic.Delete("/years/:id", DeleteAcademicYear)

		academic.Get("/semesters", GetSemesters)
		academic.Post("/semesters", CreateSemester)
		academic.Get("/semesters/:id", GetSemester)
		academic.Put("/semesters/:id", UpdateSemester)
		academic.Delete("/semesters/:id", DeleteSemester)

		academic.Get("/departments", GetDepartments)
		academic.Post("/departments", CreateDepartment)
		academic.Get("/departments/:id", GetDepartment)
		academic.Put("/departments/:id", UpdateDepartment)
		academic.Delete("/departments/:id", DeleteDepartment)

		academic.Get("/programs", GetPrograms)
		academic.Post("/programs", CreateProgram)
		academic.Get("/programs/:id", GetProgram)
		academic.Put("/programs/:id", UpdateProgram)
		academic.Delete("/programs/:id", DeleteProgram)
	}

	// Course routes
	courses := api.Group("/courses")
	{
		courses.Get("/", GetCourses)
		courses.Post("/", CreateCourse)
		courses.Get("/:id", GetCourse)
		courses.Put("/:id", UpdateCourse)
		courses.Delete("/:id", DeleteCourse)
		courses.Get("/categories", GetCourseCategories)
	}

	// Faculty routes
	faculty := api.Group("/faculty")
	{
		faculty.Get("/", GetFaculty)
		faculty.Post("/", CreateFaculty)
		faculty.Get("/:id", GetFacultyMember)
		faculty.Put("/:id", UpdateFaculty)
		faculty.Delete("/:id", DeleteFaculty)

		faculty.Get("/:id/availability", GetFacultyAvailability)
		faculty.Post("/:id/availability", AddFacultyAvailability)
		faculty.Delete("/availability/:id", DeleteFacultyAvailability)

		faculty.Get("/:id/expertise", GetFacultyExpertise)
		faculty.Post("/:id/expertise", AddFacultyExpertise)
		faculty.Delete("/expertise/:id", DeleteFacultyExpertise)
	}

	// Room routes
	rooms := api.Group("/rooms")
	{
		rooms.Get("/", GetRooms)
		rooms.Post("/", CreateRoom)
		rooms.Get("/:id", GetRoom)
		rooms.Put("/:id", UpdateRoom)
		rooms.Delete("/:id", DeleteRoom)
	}

	// Student routes
	students := api.Group("/students")
	{
		students.Get("/", GetStudents)
		students.Post("/", CreateStudent)
		students.Get("/:id", GetStudent)
		students.Put("/:id", UpdateStudent)
		students.Delete("/:id", DeleteStudent)

		students.Get("/:id/enrollments", GetStudentEnrollments)
		students.Post("/:id/enrollments", EnrollStudent)
		students.Delete("/enrollments/:id", DeleteEnrollment)
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
		timetables.Get("/:id/status", GetGenerationStatus)
		timetables.Post("/:id/publish", PublishTimetable)

		// Export
		timetables.Get("/:id/export/pdf", ExportTimetablePDF)
		timetables.Get("/:id/export/excel", ExportTimetableExcel)

		// Scheduled classes
		timetables.Get("/:id/classes", GetScheduledClasses)
		timetables.Post("/:id/classes", AddScheduledClass)
		timetables.Put("/classes/:classId", UpdateScheduledClass)
		timetables.Delete("/classes/:classId", DeleteScheduledClass)

		// Conflicts
		timetables.Get("/:id/conflicts", GetConflicts)
		timetables.Post("/conflicts/:conflictId/resolve", ResolveConflict)
	}

	// Analytics/Reports routes
	reports := api.Group("/reports")
	{
		reports.Get("/faculty-workload", GetFacultyWorkloadReport)
		reports.Get("/room-utilization", GetRoomUtilizationReport)
		reports.Get("/course-distribution", GetCourseDistributionReport)
	}
}
