package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/yourusername/timetable-scheduler/internal/database"
	"github.com/yourusername/timetable-scheduler/internal/models"
)

// GetAcademicYears retrieves all academic years
func GetAcademicYears(c *fiber.Ctx) error {
	var years []models.AcademicYear

	result := database.DB.Order("start_date DESC").Find(&years)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch academic years",
		})
	}

	return c.JSON(fiber.Map{
		"data":  years,
		"count": len(years),
	})
}

// GetAcademicYear retrieves a single academic year by ID
func GetAcademicYear(c *fiber.Ctx) error {
	id := c.Params("id")

	yearID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var year models.AcademicYear
	result := database.DB.Preload("Semesters").First(&year, yearID)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Academic year not found",
		})
	}

	return c.JSON(fiber.Map{
		"data": year,
	})
}

// CreateAcademicYear creates a new academic year
func CreateAcademicYear(c *fiber.Ctx) error {
	var year models.AcademicYear

	if err := c.BodyParser(&year); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validation
	if year.Year == "" || year.StartDate.IsZero() || year.EndDate.IsZero() {
		return c.Status(400).JSON(fiber.Map{
			"error": "Year, start_date, and end_date are required",
		})
	}

	if year.EndDate.Before(year.StartDate) {
		return c.Status(400).JSON(fiber.Map{
			"error": "End date must be after start date",
		})
	}

	result := database.DB.Create(&year)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create academic year",
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Academic year created successfully",
		"data":    year,
	})
}

// UpdateAcademicYear updates an existing academic year
func UpdateAcademicYear(c *fiber.Ctx) error {
	id := c.Params("id")

	yearID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var year models.AcademicYear
	if err := database.DB.First(&year, yearID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Academic year not found",
		})
	}

	if err := c.BodyParser(&year); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := database.DB.Save(&year).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update academic year",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Academic year updated successfully",
		"data":    year,
	})
}

// DeleteAcademicYear deletes an academic year
func DeleteAcademicYear(c *fiber.Ctx) error {
	id := c.Params("id")

	yearID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	result := database.DB.Delete(&models.AcademicYear{}, yearID)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete academic year",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{
			"error": "Academic year not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Academic year deleted successfully",
	})
}

// Semesters

func GetSemesters(c *fiber.Ctx) error {
	var semesters []models.Semester

	query := database.DB.Preload("AcademicYear").Order("start_date DESC")

	// Filter by academic year if provided
	if academicYearID := c.Query("academic_year_id"); academicYearID != "" {
		query = query.Where("academic_year_id = ?", academicYearID)
	}

	result := query.Find(&semesters)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch semesters",
		})
	}

	return c.JSON(fiber.Map{
		"data":  semesters,
		"count": len(semesters),
	})
}

func GetSemester(c *fiber.Ctx) error {
	id := c.Params("id")

	semesterID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var semester models.Semester
	result := database.DB.Preload("AcademicYear").First(&semester, semesterID)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Semester not found",
		})
	}

	return c.JSON(fiber.Map{
		"data": semester,
	})
}

func CreateSemester(c *fiber.Ctx) error {
	var semester models.Semester

	if err := c.BodyParser(&semester); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	result := database.DB.Create(&semester)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create semester",
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Semester created successfully",
		"data":    semester,
	})
}

func UpdateSemester(c *fiber.Ctx) error {
	id := c.Params("id")

	semesterID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var semester models.Semester
	if err := database.DB.First(&semester, semesterID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Semester not found",
		})
	}

	if err := c.BodyParser(&semester); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := database.DB.Save(&semester).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update semester",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Semester updated successfully",
		"data":    semester,
	})
}

func DeleteSemester(c *fiber.Ctx) error {
	id := c.Params("id")

	semesterID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	result := database.DB.Delete(&models.Semester{}, semesterID)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete semester",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Semester deleted successfully",
	})
}

// Departments

func GetDepartments(c *fiber.Ctx) error {
	var departments []models.Department

	result := database.DB.Order("name ASC").Find(&departments)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch departments",
		})
	}

	return c.JSON(fiber.Map{
		"data":  departments,
		"count": len(departments),
	})
}

func GetDepartment(c *fiber.Ctx) error {
	id := c.Params("id")

	deptID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var department models.Department
	result := database.DB.Preload("Programs").Preload("Courses").Preload("Faculty").First(&department, deptID)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Department not found",
		})
	}

	return c.JSON(fiber.Map{
		"data": department,
	})
}

func CreateDepartment(c *fiber.Ctx) error {
	var department models.Department

	if err := c.BodyParser(&department); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	result := database.DB.Create(&department)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create department",
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Department created successfully",
		"data":    department,
	})
}

func UpdateDepartment(c *fiber.Ctx) error {
	id := c.Params("id")

	deptID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var department models.Department
	if err := database.DB.First(&department, deptID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Department not found",
		})
	}

	if err := c.BodyParser(&department); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := database.DB.Save(&department).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update department",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Department updated successfully",
		"data":    department,
	})
}

func DeleteDepartment(c *fiber.Ctx) error {
	id := c.Params("id")

	deptID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	result := database.DB.Delete(&models.Department{}, deptID)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete department",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Department deleted successfully",
	})
}

// Programs

func GetPrograms(c *fiber.Ctx) error {
	var programs []models.Program

	result := database.DB.Preload("Department").Order("name ASC").Find(&programs)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch programs",
		})
	}

	return c.JSON(fiber.Map{
		"data":  programs,
		"count": len(programs),
	})
}

func GetProgram(c *fiber.Ctx) error {
	id := c.Params("id")

	programID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var program models.Program
	result := database.DB.Preload("Department").First(&program, programID)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Program not found",
		})
	}

	return c.JSON(fiber.Map{
		"data": program,
	})
}

func CreateProgram(c *fiber.Ctx) error {
	var program models.Program

	if err := c.BodyParser(&program); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	result := database.DB.Create(&program)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create program",
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Program created successfully",
		"data":    program,
	})
}

func UpdateProgram(c *fiber.Ctx) error {
	id := c.Params("id")

	programID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var program models.Program
	if err := database.DB.First(&program, programID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Program not found",
		})
	}

	if err := c.BodyParser(&program); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := database.DB.Save(&program).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update program",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Program updated successfully",
		"data":    program,
	})
}

func DeleteProgram(c *fiber.Ctx) error {
	id := c.Params("id")

	programID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	result := database.DB.Delete(&models.Program{}, programID)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete program",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Program deleted successfully",
	})
}
