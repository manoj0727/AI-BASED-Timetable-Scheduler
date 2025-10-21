package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/yourusername/timetable-scheduler/internal/database"
	"github.com/yourusername/timetable-scheduler/internal/models"
)

// GetFaculty retrieves all faculty members
func GetFaculty(c *fiber.Ctx) error {
	var faculty []models.Faculty

	query := database.DB.Preload("Department").Order("last_name ASC, first_name ASC")

	// Filter by department if provided
	if deptID := c.Query("department_id"); deptID != "" {
		query = query.Where("department_id = ?", deptID)
	}

	result := query.Find(&faculty)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch faculty",
		})
	}

	return c.JSON(fiber.Map{
		"data":  faculty,
		"count": len(faculty),
	})
}

// GetFacultyMember retrieves a single faculty member by ID
func GetFacultyMember(c *fiber.Ctx) error {
	id := c.Params("id")

	facultyID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var faculty models.Faculty
	result := database.DB.
		Preload("Department").
		Preload("Availability").
		Preload("Expertise").
		Preload("Expertise.Course").
		First(&faculty, facultyID)

	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Faculty member not found",
		})
	}

	return c.JSON(fiber.Map{
		"data": faculty,
	})
}

// CreateFaculty creates a new faculty member
func CreateFaculty(c *fiber.Ctx) error {
	var faculty models.Faculty

	if err := c.BodyParser(&faculty); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validation
	if faculty.EmployeeID == "" || faculty.FirstName == "" || faculty.LastName == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Employee ID, first name, and last name are required",
		})
	}

	if faculty.Email == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Email is required",
		})
	}

	// Check for duplicate employee ID
	var existing models.Faculty
	if err := database.DB.Where("employee_id = ?", faculty.EmployeeID).First(&existing).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{
			"error": "Faculty with this employee ID already exists",
		})
	}

	// Check for duplicate email
	if err := database.DB.Where("email = ?", faculty.Email).First(&existing).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{
			"error": "Faculty with this email already exists",
		})
	}

	result := database.DB.Create(&faculty)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create faculty member",
		})
	}

	// Reload with associations
	database.DB.Preload("Department").First(&faculty, faculty.ID)

	return c.Status(201).JSON(fiber.Map{
		"message": "Faculty member created successfully",
		"data":    faculty,
	})
}

// UpdateFaculty updates an existing faculty member
func UpdateFaculty(c *fiber.Ctx) error {
	id := c.Params("id")

	facultyID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var faculty models.Faculty
	if err := database.DB.First(&faculty, facultyID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Faculty member not found",
		})
	}

	// Store originals to check for duplicates
	originalEmployeeID := faculty.EmployeeID
	originalEmail := faculty.Email

	if err := c.BodyParser(&faculty); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Check for duplicate employee ID if changed
	if faculty.EmployeeID != originalEmployeeID {
		var existing models.Faculty
		if err := database.DB.Where("employee_id = ? AND id != ?", faculty.EmployeeID, facultyID).First(&existing).Error; err == nil {
			return c.Status(409).JSON(fiber.Map{
				"error": "Faculty with this employee ID already exists",
			})
		}
	}

	// Check for duplicate email if changed
	if faculty.Email != originalEmail {
		var existing models.Faculty
		if err := database.DB.Where("email = ? AND id != ?", faculty.Email, facultyID).First(&existing).Error; err == nil {
			return c.Status(409).JSON(fiber.Map{
				"error": "Faculty with this email already exists",
			})
		}
	}

	if err := database.DB.Save(&faculty).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update faculty member",
		})
	}

	// Reload with associations
	database.DB.Preload("Department").First(&faculty, faculty.ID)

	return c.JSON(fiber.Map{
		"message": "Faculty member updated successfully",
		"data":    faculty,
	})
}

// DeleteFaculty deletes a faculty member
func DeleteFaculty(c *fiber.Ctx) error {
	id := c.Params("id")

	facultyID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	result := database.DB.Delete(&models.Faculty{}, facultyID)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete faculty member",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{
			"error": "Faculty member not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Faculty member deleted successfully",
	})
}

// GetFacultyAvailability retrieves availability for a faculty member
func GetFacultyAvailability(c *fiber.Ctx) error {
	id := c.Params("id")

	facultyID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var availability []models.FacultyAvailability
	result := database.DB.Where("faculty_id = ?", facultyID).Find(&availability)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch availability",
		})
	}

	return c.JSON(fiber.Map{
		"data":  availability,
		"count": len(availability),
	})
}

// AddFacultyAvailability adds availability slot for a faculty member
func AddFacultyAvailability(c *fiber.Ctx) error {
	id := c.Params("id")

	facultyID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	// Check if faculty exists
	var faculty models.Faculty
	if err := database.DB.First(&faculty, facultyID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Faculty member not found",
		})
	}

	var availability models.FacultyAvailability
	if err := c.BodyParser(&availability); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	availability.FacultyID = facultyID

	// Validation
	if availability.DayOfWeek < 0 || availability.DayOfWeek > 6 {
		return c.Status(400).JSON(fiber.Map{
			"error": "Day of week must be between 0 (Sunday) and 6 (Saturday)",
		})
	}

	result := database.DB.Create(&availability)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to add availability",
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Availability added successfully",
		"data":    availability,
	})
}

// DeleteFacultyAvailability deletes an availability slot
func DeleteFacultyAvailability(c *fiber.Ctx) error {
	facultyID := c.Params("id")
	availabilityID := c.Params("availability_id")

	availID, err := uuid.Parse(availabilityID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid availability ID format",
		})
	}

	result := database.DB.Where("id = ? AND faculty_id = ?", availID, facultyID).Delete(&models.FacultyAvailability{})
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete availability",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{
			"error": "Availability slot not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Availability deleted successfully",
	})
}

// GetFacultyExpertise retrieves expertise for a faculty member
func GetFacultyExpertise(c *fiber.Ctx) error {
	id := c.Params("id")

	facultyID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var expertise []models.FacultyExpertise
	result := database.DB.Preload("Course").Where("faculty_id = ?", facultyID).Find(&expertise)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch expertise",
		})
	}

	return c.JSON(fiber.Map{
		"data":  expertise,
		"count": len(expertise),
	})
}

// AddFacultyExpertise adds expertise (course preference) for a faculty member
func AddFacultyExpertise(c *fiber.Ctx) error {
	id := c.Params("id")

	facultyID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	// Check if faculty exists
	var faculty models.Faculty
	if err := database.DB.First(&faculty, facultyID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Faculty member not found",
		})
	}

	var expertise models.FacultyExpertise
	if err := c.BodyParser(&expertise); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	expertise.FacultyID = facultyID

	// Check if course exists
	var course models.Course
	if err := database.DB.First(&course, expertise.CourseID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Course not found",
		})
	}

	// Check for duplicate
	var existing models.FacultyExpertise
	if err := database.DB.Where("faculty_id = ? AND course_id = ?", facultyID, expertise.CourseID).First(&existing).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{
			"error": "This expertise already exists",
		})
	}

	result := database.DB.Create(&expertise)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to add expertise",
		})
	}

	// Reload with course
	database.DB.Preload("Course").First(&expertise, expertise.ID)

	return c.Status(201).JSON(fiber.Map{
		"message": "Expertise added successfully",
		"data":    expertise,
	})
}

// DeleteFacultyExpertise deletes an expertise entry
func DeleteFacultyExpertise(c *fiber.Ctx) error {
	facultyID := c.Params("id")
	expertiseID := c.Params("expertise_id")

	expID, err := uuid.Parse(expertiseID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid expertise ID format",
		})
	}

	result := database.DB.Where("id = ? AND faculty_id = ?", expID, facultyID).Delete(&models.FacultyExpertise{})
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete expertise",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{
			"error": "Expertise entry not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Expertise deleted successfully",
	})
}
