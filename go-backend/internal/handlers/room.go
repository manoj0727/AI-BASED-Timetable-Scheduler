package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/yourusername/timetable-scheduler/internal/database"
	"github.com/yourusername/timetable-scheduler/internal/models"
)

// GetRooms retrieves all rooms
func GetRooms(c *fiber.Ctx) error {
	var rooms []models.Room

	query := database.DB.Order("building ASC, room_number ASC")

	// Filter by building if provided
	if building := c.Query("building"); building != "" {
		query = query.Where("building = ?", building)
	}

	// Filter by is_lab if provided
	if isLab := c.Query("is_lab"); isLab != "" {
		query = query.Where("is_lab = ?", isLab)
	}

	// Filter by minimum capacity if provided
	if minCapacity := c.Query("min_capacity"); minCapacity != "" {
		query = query.Where("capacity >= ?", minCapacity)
	}

	result := query.Find(&rooms)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch rooms",
		})
	}

	return c.JSON(fiber.Map{
		"data":  rooms,
		"count": len(rooms),
	})
}

// GetRoom retrieves a single room by ID
func GetRoom(c *fiber.Ctx) error {
	id := c.Params("id")

	roomID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var room models.Room
	result := database.DB.First(&room, roomID)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Room not found",
		})
	}

	return c.JSON(fiber.Map{
		"data": room,
	})
}

// CreateRoom creates a new room
func CreateRoom(c *fiber.Ctx) error {
	var room models.Room

	if err := c.BodyParser(&room); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validation
	if room.RoomNumber == "" || room.Building == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Room number and building are required",
		})
	}

	if room.Capacity <= 0 {
		return c.Status(400).JSON(fiber.Map{
			"error": "Capacity must be greater than 0",
		})
	}

	// Check for duplicate room
	var existing models.Room
	if err := database.DB.Where("room_number = ? AND building = ?", room.RoomNumber, room.Building).First(&existing).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{
			"error": "Room with this number already exists in this building",
		})
	}

	// Initialize features if nil
	if room.Features == nil {
		room.Features = pq.StringArray{}
	}

	result := database.DB.Create(&room)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create room",
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Room created successfully",
		"data":    room,
	})
}

// UpdateRoom updates an existing room
func UpdateRoom(c *fiber.Ctx) error {
	id := c.Params("id")

	roomID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var room models.Room
	if err := database.DB.First(&room, roomID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Room not found",
		})
	}

	// Store originals to check for duplicates
	originalRoomNumber := room.RoomNumber
	originalBuilding := room.Building

	if err := c.BodyParser(&room); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Check for duplicate room if room number or building changed
	if room.RoomNumber != originalRoomNumber || room.Building != originalBuilding {
		var existing models.Room
		if err := database.DB.Where("room_number = ? AND building = ? AND id != ?", room.RoomNumber, room.Building, roomID).First(&existing).Error; err == nil {
			return c.Status(409).JSON(fiber.Map{
				"error": "Room with this number already exists in this building",
			})
		}
	}

	if err := database.DB.Save(&room).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update room",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Room updated successfully",
		"data":    room,
	})
}

// DeleteRoom deletes a room
func DeleteRoom(c *fiber.Ctx) error {
	id := c.Params("id")

	roomID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	result := database.DB.Delete(&models.Room{}, roomID)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete room",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{
			"error": "Room not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Room deleted successfully",
	})
}
