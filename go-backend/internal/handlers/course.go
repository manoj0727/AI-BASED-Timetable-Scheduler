package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/yourusername/timetable-scheduler/internal/database"
	"github.com/yourusername/timetable-scheduler/internal/models"
)

// GetCourses retrieves all courses
func GetCourses(c *fiber.Ctx) error {
	var courses []models.Course

	query := database.DB.Preload("Department").Order("code ASC")

	// Filter by department if provided
	if deptID := c.Query("department_id"); deptID != "" {
		query = query.Where("department_id = ?", deptID)
	}

	// Filter by is_lab if provided
	if isLab := c.Query("is_lab"); isLab != "" {
		query = query.Where("is_lab = ?", isLab)
	}

	result := query.Find(&courses)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch courses",
		})
	}

	return c.JSON(fiber.Map{
		"data":  courses,
		"count": len(courses),
	})
}

// GetCourse retrieves a single course by ID
func GetCourse(c *fiber.Ctx) error {
	id := c.Params("id")

	courseID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var course models.Course
	result := database.DB.Preload("Department").First(&course, courseID)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Course not found",
		})
	}

	return c.JSON(fiber.Map{
		"data": course,
	})
}

// CreateCourse creates a new course
func CreateCourse(c *fiber.Ctx) error {
	var course models.Course

	if err := c.BodyParser(&course); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validation
	if course.Code == "" || course.Name == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Course code and name are required",
		})
	}

	if course.Credits <= 0 {
		return c.Status(400).JSON(fiber.Map{
			"error": "Credits must be greater than 0",
		})
	}

	// Check for duplicate code
	var existing models.Course
	if err := database.DB.Where("code = ?", course.Code).First(&existing).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{
			"error": "Course with this code already exists",
		})
	}

	result := database.DB.Create(&course)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create course",
		})
	}

	// Reload with associations
	database.DB.Preload("Department").First(&course, course.ID)

	return c.Status(201).JSON(fiber.Map{
		"message": "Course created successfully",
		"data":    course,
	})
}

// UpdateCourse updates an existing course
func UpdateCourse(c *fiber.Ctx) error {
	id := c.Params("id")

	courseID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var course models.Course
	if err := database.DB.First(&course, courseID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Course not found",
		})
	}

	// Store original code to check for duplicates
	originalCode := course.Code

	if err := c.BodyParser(&course); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Check for duplicate code if changed
	if course.Code != originalCode {
		var existing models.Course
		if err := database.DB.Where("code = ? AND id != ?", course.Code, courseID).First(&existing).Error; err == nil {
			return c.Status(409).JSON(fiber.Map{
				"error": "Course with this code already exists",
			})
		}
	}

	if err := database.DB.Save(&course).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update course",
		})
	}

	// Reload with associations
	database.DB.Preload("Department").First(&course, course.ID)

	return c.JSON(fiber.Map{
		"message": "Course updated successfully",
		"data":    course,
	})
}

// DeleteCourse deletes a course
func DeleteCourse(c *fiber.Ctx) error {
	id := c.Params("id")

	courseID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	result := database.DB.Delete(&models.Course{}, courseID)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete course",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{
			"error": "Course not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Course deleted successfully",
	})
}

// GetCourseCategories returns list of unique course categories
func GetCourseCategories(c *fiber.Ctx) error {
	var categories []string

	err := database.DB.Model(&models.Course{}).
		Distinct().
		Pluck("category", &categories).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch categories",
		})
	}

	return c.JSON(fiber.Map{
		"data":  categories,
		"count": len(categories),
	})
}
