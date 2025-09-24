package handlers

import (
	"backend/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type NotificationHandler struct {
	DB *gorm.DB
}

func NewNotificationHandler(db *gorm.DB) *NotificationHandler {
	return &NotificationHandler{
		DB: db,
	}
}

// GetNotifications - GET /api/notifications
func (h *NotificationHandler) GetNotifications(c *fiber.Ctx) error {
	// TODO: Get user ID from JWT token
	userId := c.Query("user_id") // Temporary: get from query param
	if userId == "" {
		// Use the actual admin user UUID from database
		userId = "41b805d8-f8c0-4af6-974b-84f03aeafdb7"
	}

	var notifications []models.Notification
	query := h.DB.Where("user_id = ?", userId).Order("created_at DESC")

	// Limit results
	if limit := c.Query("limit"); limit != "" {
		if l, err := strconv.Atoi(limit); err == nil && l > 0 {
			query = query.Limit(l)
		}
	}

	// Filter by read status
	if isRead := c.Query("is_read"); isRead != "" {
		if isRead == "true" {
			query = query.Where("is_read = ?", true)
		} else if isRead == "false" {
			query = query.Where("is_read = ?", false)
		}
	}

	if err := query.Find(&notifications).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   "Failed to fetch notifications",
			"details": err.Error(),
		})
	}

	// If no notifications found, return empty array instead of null
	if notifications == nil {
		notifications = []models.Notification{}
	}

	return c.JSON(notifications)
}

// MarkAsRead - PATCH /api/notifications/:id/read
func (h *NotificationHandler) MarkAsRead(c *fiber.Ctx) error {
	notificationId := c.Params("id")

	result := h.DB.Model(&models.Notification{}).
		Where("id = ?", notificationId).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": "NOW()",
		})

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   "Failed to mark notification as read",
			"details": result.Error.Error(),
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Notification not found"})
	}

	return c.JSON(fiber.Map{"message": "Notification marked as read"})
}
