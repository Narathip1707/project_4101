package handlers

import (
	"backend/models"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type AdvisorStudentHandler struct {
	DB *gorm.DB
}

func NewAdvisorStudentHandler(db *gorm.DB) *AdvisorStudentHandler {
	return &AdvisorStudentHandler{DB: db}
}

// GetAdvisorStudents - Get all students under advisor supervision
func (h *AdvisorStudentHandler) GetAdvisorStudents(c *fiber.Ctx) error {
	// Get user from context (set by JWT middleware)
	userInterface := c.Locals("user")
	if userInterface == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "User not found in token",
		})
	}
	claims := userInterface.(*models.JWTClaims)

	// Get advisor record
	var advisor models.Advisor
	if err := h.DB.Where("user_id = ?", claims.UserID).First(&advisor).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Advisor not found",
		})
	}

	// Get students with their projects and files
	var students []models.Student
	if err := h.DB.Preload("User").
		Preload("Projects", func(db *gorm.DB) *gorm.DB {
			return db.Where("advisor_id = ?", advisor.ID).Order("created_at DESC")
		}).
		Preload("Projects.ProjectFiles").
		Where("EXISTS (SELECT 1 FROM projects WHERE projects.student_id = students.id AND projects.advisor_id = ?)", advisor.ID).
		Find(&students).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch students",
		})
	}

	return c.JSON(students)
}

// GetStudentDetail - Get detailed student information
func (h *AdvisorStudentHandler) GetStudentDetail(c *fiber.Ctx) error {
	studentID := c.Params("id")

	var student models.Student
	if err := h.DB.Preload("User").
		Preload("Projects", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at DESC")
		}).
		Preload("Projects.ProjectFiles").
		Where("id = ?", studentID).
		First(&student).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Student not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch student details",
		})
	}

	return c.JSON(student)
}

// UpdateStudent - Update student information
func (h *AdvisorStudentHandler) UpdateStudent(c *fiber.Ctx) error {
	studentID := c.Params("id")

	var updateData struct {
		Notes      *string `json:"notes"`
		Department *string `json:"department"`
		Year       *int    `json:"year"`
	}

	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Find student
	var student models.Student
	if err := h.DB.Where("id = ?", studentID).First(&student).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Student not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find student",
		})
	}

	// Update fields if provided
	updates := make(map[string]interface{})
	if updateData.Notes != nil {
		updates["notes"] = *updateData.Notes
	}
	if updateData.Department != nil {
		updates["department"] = *updateData.Department
	}
	if updateData.Year != nil {
		updates["year"] = *updateData.Year
	}

	if len(updates) > 0 {
		updates["updated_at"] = time.Now()
		if err := h.DB.Model(&student).Updates(updates).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to update student",
			})
		}
	}

	return c.JSON(fiber.Map{
		"message": "Student updated successfully",
	})
}

// UpdateProjectProgress - Update project progress
func (h *AdvisorStudentHandler) UpdateProjectProgress(c *fiber.Ctx) error {
	projectID := c.Params("id")

	var progressData struct {
		ProgressPercentage int    `json:"progress_percentage"`
		Notes              string `json:"notes"`
		UpdatedBy          string `json:"updated_by"`
	}

	if err := c.BodyParser(&progressData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate progress percentage
	if progressData.ProgressPercentage < 0 || progressData.ProgressPercentage > 100 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Progress percentage must be between 0 and 100",
		})
	}

	// Find project
	var project models.Project
	if err := h.DB.Where("id = ?", projectID).First(&project).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Project not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find project",
		})
	}

	// Update project progress
	updates := map[string]interface{}{
		"progress_percentage": progressData.ProgressPercentage,
		"updated_at":          time.Now(),
	}

	if err := h.DB.Model(&project).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update project progress",
		})
	}

	// Create progress log entry
	progressLog := models.Log{
		Action:      "progress_update",
		Description: fmt.Sprintf("Project %s progress updated to %d%%. Notes: %s", project.ID, progressData.ProgressPercentage, progressData.Notes),
		CreatedAt:   time.Now(),
	}

	if err := h.DB.Create(&progressLog).Error; err != nil {
		// Log error but don't fail the request
		// In production, you might want to log this properly
	}

	return c.JSON(fiber.Map{
		"message":             "Project progress updated successfully",
		"progress_percentage": progressData.ProgressPercentage,
	})
}

// UpdateProjectStatus - Update project status
func (h *AdvisorStudentHandler) UpdateProjectStatus(c *fiber.Ctx) error {
	projectID := c.Params("id")

	var statusData struct {
		Status string `json:"status"`
	}

	if err := c.BodyParser(&statusData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate status
	validStatuses := []string{"pending", "approved", "in-progress", "completed", "rejected"}
	isValidStatus := false
	for _, status := range validStatuses {
		if statusData.Status == status {
			isValidStatus = true
			break
		}
	}

	if !isValidStatus {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid status. Valid statuses: pending, approved, in-progress, completed, rejected",
		})
	}

	// Find project
	var project models.Project
	if err := h.DB.Where("id = ?", projectID).First(&project).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Project not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find project",
		})
	}

	// Update project status
	if err := h.DB.Model(&project).Updates(map[string]interface{}{
		"status":     statusData.Status,
		"updated_at": time.Now(),
	}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update project status",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Project status updated successfully",
		"status":  statusData.Status,
	})
}

// AddProjectMilestone - Add milestone to project
func (h *AdvisorStudentHandler) AddProjectMilestone(c *fiber.Ctx) error {
	projectID := c.Params("id")

	var milestoneData struct {
		Title           string `json:"title"`
		Description     string `json:"description"`
		DueDate         string `json:"due_date"`
		Status          string `json:"status"`
		ProgressPercent int    `json:"progress_percentage"`
	}

	if err := c.BodyParser(&milestoneData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if milestoneData.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Title is required",
		})
	}

	// Parse due date
	dueDate, err := time.Parse("2006-01-02", milestoneData.DueDate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid due date format. Use YYYY-MM-DD",
		})
	}

	// Find project
	var project models.Project
	if err := h.DB.Where("id = ?", projectID).First(&project).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Project not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find project",
		})
	}

	// For this example, we'll store milestones as logs with a specific action
	// In a real application, you might want a separate milestones table
	milestoneLog := models.Log{
		Action: "milestone_created",
		Description: fmt.Sprintf("Title: %s, Description: %s, Due Date: %s, Status: %s",
			milestoneData.Title, milestoneData.Description, milestoneData.DueDate, milestoneData.Status),
		CreatedAt: time.Now(),
	}

	if err := h.DB.Create(&milestoneLog).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create milestone",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Milestone added successfully",
		"milestone": map[string]interface{}{
			"id":                  milestoneLog.ID,
			"title":               milestoneData.Title,
			"description":         milestoneData.Description,
			"due_date":            dueDate,
			"status":              milestoneData.Status,
			"progress_percentage": milestoneData.ProgressPercent,
		},
	})
}
