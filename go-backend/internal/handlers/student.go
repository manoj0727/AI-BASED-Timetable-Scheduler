package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/yourusername/timetable-scheduler/internal/database"
	"github.com/yourusername/timetable-scheduler/internal/models"
)

// GetStudents retrieves all students
func GetStudents(c *fiber.Ctx) error {
	var students []models.Student

	query := database.DB.Preload("Program").Preload("Program.Department").Order("last_name ASC, first_name ASC")

	// Filter by program if provided
	if programID := c.Query("program_id"); programID != "" {
		query = query.Where("program_id = ?", programID)
	}

	// Filter by semester if provided
	if semester := c.Query("semester"); semester != "" {
		query = query.Where("semester = ?", semester)
	}

	result := query.Find(&students)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch students",
		})
	}

	return c.JSON(fiber.Map{
		"data":  students,
		"count": len(students),
	})
}

// GetStudent retrieves a single student by ID
func GetStudent(c *fiber.Ctx) error {
	id := c.Params("id")

	studentID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var student models.Student
	result := database.DB.
		Preload("Program").
		Preload("Program.Department").
		Preload("Enrollments").
		Preload("Enrollments.Course").
		First(&student, studentID)

	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Student not found",
		})
	}

	return c.JSON(fiber.Map{
		"data": student,
	})
}

// CreateStudent creates a new student
func CreateStudent(c *fiber.Ctx) error {
	var student models.Student

	if err := c.BodyParser(&student); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validation
	if student.RollNumber == "" || student.FirstName == "" || student.LastName == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Roll number, first name, and last name are required",
		})
	}

	if student.Email == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Email is required",
		})
	}

	// Check for duplicate roll number
	var existing models.Student
	if err := database.DB.Where("roll_number = ?", student.RollNumber).First(&existing).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{
			"error": "Student with this roll number already exists",
		})
	}

	// Check for duplicate email
	if err := database.DB.Where("email = ?", student.Email).First(&existing).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{
			"error": "Student with this email already exists",
		})
	}

	result := database.DB.Create(&student)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create student",
		})
	}

	// Reload with associations
	database.DB.Preload("Program").Preload("Program.Department").First(&student, student.ID)

	return c.Status(201).JSON(fiber.Map{
		"message": "Student created successfully",
		"data":    student,
	})
}

// UpdateStudent updates an existing student
func UpdateStudent(c *fiber.Ctx) error {
	id := c.Params("id")

	studentID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var student models.Student
	if err := database.DB.First(&student, studentID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Student not found",
		})
	}

	// Store originals to check for duplicates
	originalRollNumber := student.RollNumber
	originalEmail := student.Email

	if err := c.BodyParser(&student); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Check for duplicate roll number if changed
	if student.RollNumber != originalRollNumber {
		var existing models.Student
		if err := database.DB.Where("roll_number = ? AND id != ?", student.RollNumber, studentID).First(&existing).Error; err == nil {
			return c.Status(409).JSON(fiber.Map{
				"error": "Student with this roll number already exists",
			})
		}
	}

	// Check for duplicate email if changed
	if student.Email != originalEmail {
		var existing models.Student
		if err := database.DB.Where("email = ? AND id != ?", student.Email, studentID).First(&existing).Error; err == nil {
			return c.Status(409).JSON(fiber.Map{
				"error": "Student with this email already exists",
			})
		}
	}

	if err := database.DB.Save(&student).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update student",
		})
	}

	// Reload with associations
	database.DB.Preload("Program").Preload("Program.Department").First(&student, student.ID)

	return c.JSON(fiber.Map{
		"message": "Student updated successfully",
		"data":    student,
	})
}

// DeleteStudent deletes a student
func DeleteStudent(c *fiber.Ctx) error {
	id := c.Params("id")

	studentID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	result := database.DB.Delete(&models.Student{}, studentID)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete student",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{
			"error": "Student not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Student deleted successfully",
	})
}

// GetStudentEnrollments retrieves enrollments for a student
func GetStudentEnrollments(c *fiber.Ctx) error {
	id := c.Params("id")

	studentID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var enrollments []models.Enrollment
	result := database.DB.
		Preload("Course").
		Preload("Semester").
		Where("student_id = ?", studentID).
		Find(&enrollments)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch enrollments",
		})
	}

	return c.JSON(fiber.Map{
		"data":  enrollments,
		"count": len(enrollments),
	})
}

// EnrollStudent enrolls a student in a course
func EnrollStudent(c *fiber.Ctx) error {
	id := c.Params("id")

	studentID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	// Check if student exists
	var student models.Student
	if err := database.DB.First(&student, studentID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Student not found",
		})
	}

	var enrollment models.Enrollment
	if err := c.BodyParser(&enrollment); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	enrollment.StudentID = studentID

	// Check if course exists
	var course models.Course
	if err := database.DB.First(&course, enrollment.CourseID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Course not found",
		})
	}

	// Check if semester exists
	var semester models.Semester
	if err := database.DB.First(&semester, enrollment.SemesterID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Semester not found",
		})
	}

	// Check for duplicate enrollment
	var existing models.Enrollment
	if err := database.DB.Where("student_id = ? AND course_id = ? AND semester_id = ?",
		studentID, enrollment.CourseID, enrollment.SemesterID).First(&existing).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{
			"error": "Student is already enrolled in this course for this semester",
		})
	}

	result := database.DB.Create(&enrollment)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to enroll student",
		})
	}

	// Reload with associations
	database.DB.Preload("Course").Preload("Semester").First(&enrollment, enrollment.ID)

	return c.Status(201).JSON(fiber.Map{
		"message": "Student enrolled successfully",
		"data":    enrollment,
	})
}

// DeleteEnrollment deletes an enrollment
func DeleteEnrollment(c *fiber.Ctx) error {
	studentID := c.Params("id")
	enrollmentID := c.Params("enrollment_id")

	enrID, err := uuid.Parse(enrollmentID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid enrollment ID format",
		})
	}

	result := database.DB.Where("id = ? AND student_id = ?", enrID, studentID).Delete(&models.Enrollment{})
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete enrollment",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{
			"error": "Enrollment not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Enrollment deleted successfully",
	})
}
