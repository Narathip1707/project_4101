package handlers

import (
	"backend/models"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FileHandler struct {
	DB *gorm.DB
}

func NewFileHandler(db *gorm.DB) *FileHandler {
	// Create uploads directory if not exists
	if err := os.MkdirAll("./uploads", 0755); err != nil {
		panic("Failed to create uploads directory: " + err.Error())
	}

	return &FileHandler{
		DB: db,
	}
}

// UploadFile - POST /api/projects/:id/files
func (h *FileHandler) UploadFile(c *fiber.Ctx) error {
	projectId := c.Params("id")

	// Verify project exists
	var project models.Project
	if err := h.DB.First(&project, "id = ?", projectId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{"error": "Project not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Failed to verify project"})
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "No file uploaded"})
	}

	// Validate file size (10MB limit)
	maxSize := int64(10 * 1024 * 1024) // 10MB
	if file.Size > maxSize {
		return c.Status(400).JSON(fiber.Map{"error": "File too large (max 10MB)"})
	}

	// Validate file extension
	allowedExts := []string{".pdf", ".doc", ".docx", ".ppt", ".pptx", ".zip", ".rar", ".txt", ".jpg", ".jpeg", ".png"}
	ext := strings.ToLower(filepath.Ext(file.Filename))
	isAllowed := false
	for _, allowedExt := range allowedExts {
		if ext == allowedExt {
			isAllowed = true
			break
		}
	}
	if !isAllowed {
		return c.Status(400).JSON(fiber.Map{"error": "File type not allowed"})
	}

	// Generate unique filename
	fileId := uuid.New().String()
	newFilename := fileId + ext
	savePath := filepath.Join("uploads", newFilename)

	// Save file to disk
	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save file"})
	}

	// Get category from form (default to 'other')
	category := c.FormValue("file_category")
	if category == "" {
		category = "other"
	}

	// Validate category
	validCategories := []string{"proposal", "progress_report", "final_report", "presentation", "source_code", "other"}
	isValidCategory := false
	for _, validCat := range validCategories {
		if category == validCat {
			isValidCategory = true
			break
		}
	}
	if !isValidCategory {
		category = "other"
	}

	// TODO: Get actual user ID from JWT token
	uploadedBy := c.FormValue("uploaded_by")
	if uploadedBy == "" {
		uploadedBy = "dummy-user-id" // Replace with actual JWT parsing
	}

	// Get file type from content type
	fileType := file.Header.Get("Content-Type")
	if fileType == "" {
		fileType = "application/octet-stream"
	}

	// Create file size pointer
	fileSize := file.Size

	// Save file record to database
	projectFile := models.ProjectFile{
		ID:           fileId,
		ProjectID:    projectId,
		UploadedBy:   uploadedBy,
		FileName:     file.Filename,
		FilePath:     savePath,
		FileSize:     &fileSize, // แก้ไข: ใช้ pointer
		FileType:     fileType,  // แก้ไข: ใช้ FileType แทน MimeType
		FileCategory: category,
		FileStatus:   "pending", // แก้ไข: ใช้ FileStatus แทน Status
		Version:      1,
		Description:  c.FormValue("description"),
		IsPublic:     false,
		// CreatedAt และ UpdatedAt จะถูกตั้งค่าอัตโนมัติ
	}

	if err := h.DB.Create(&projectFile).Error; err != nil {
		// Clean up file if database save fails
		os.Remove(savePath)
		return c.Status(500).JSON(fiber.Map{
			"error":   "Failed to save file record",
			"details": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "File uploaded successfully",
		"file":    projectFile,
	})
}

// DownloadFile - GET /api/files/:id/download
func (h *FileHandler) DownloadFile(c *fiber.Ctx) error {
	fileId := c.Params("id")
	var projectFile models.ProjectFile

	if err := h.DB.First(&projectFile, "id = ?", fileId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{"error": "File not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch file"})
	}

	// Check if file exists on disk
	if _, err := os.Stat(projectFile.FilePath); os.IsNotExist(err) {
		return c.Status(404).JSON(fiber.Map{"error": "File not found on disk"})
	}

	return c.Download(projectFile.FilePath, projectFile.FileName)
}

// ReviewFile - PATCH /api/files/:id/review
func (h *FileHandler) ReviewFile(c *fiber.Ctx) error {
	fileId := c.Params("id")

	var input struct {
		Status   string `json:"status"` // "approved" or "rejected"
		Comments string `json:"comments"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Validate status
	if input.Status != "approved" && input.Status != "rejected" {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid status. Use 'approved' or 'rejected'"})
	}

	// Update file status
	now := time.Now()
	result := h.DB.Model(&models.ProjectFile{}).
		Where("id = ?", fileId).
		Updates(map[string]interface{}{
			"file_status": input.Status,   // แก้ไข: ใช้ file_status
			"description": input.Comments, // แก้ไข: ใช้ description แทน comments
			"updated_at":  &now,
		})

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   "Failed to update file status",
			"details": result.Error.Error(),
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "File not found"})
	}

	return c.JSON(fiber.Map{"message": "File status updated successfully"})
}

// GetRecentFiles - GET /api/files/recent
func (h *FileHandler) GetRecentFiles(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 5)
	if limit > 50 {
		limit = 50 // Maximum 50 files
	}

	var files []models.ProjectFile
	err := h.DB.Preload("Project").
		Order("created_at DESC").
		Limit(limit).
		Find(&files).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch recent files",
		})
	}

	return c.JSON(files)
}
