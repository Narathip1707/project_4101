package handlers

import (
	"backend/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type ProjectHandler struct {
	DB *gorm.DB
}

func NewProjectHandler(db *gorm.DB) *ProjectHandler {
	return &ProjectHandler{
		DB: db,
	}
}

// GetProjects - GET /api/projects
func (h *ProjectHandler) GetProjects(c *fiber.Ctx) error {
	var projects []models.Project
	query := h.DB.Preload("Student.User").Preload("Advisor.User")

	// Authorization filter based on user role
	userID := c.Locals("user_id").(string)
	userRole := c.Locals("user_role").(string)

	switch userRole {
	case "student":
		// Students can only see their own projects
		query = query.Where("student_id = ?", userID)
	case "advisor":
		// Advisors can see projects they are assigned to
		query = query.Where("advisor_id = ?", userID)
	case "admin":
		// Admins can see all projects (no additional filter)
	default:
		return c.Status(403).JSON(fiber.Map{
			"error": "Unauthorized access",
		})
	}

	// Search functionality
	if search := c.Query("q"); search != "" {
		query = query.Where("title ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Status filter
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	// Limit results
	if limit := c.Query("limit"); limit != "" {
		if l, err := strconv.Atoi(limit); err == nil && l > 0 {
			query = query.Limit(l)
		}
	}

	if err := query.Order("created_at DESC").Find(&projects).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   "Failed to fetch projects",
			"details": err.Error(),
		})
	}

	return c.JSON(projects)
}

// GetProject - GET /api/projects/:id
func (h *ProjectHandler) GetProject(c *fiber.Ctx) error {
	id := c.Params("id")
	var project models.Project

	if err := h.DB.Preload("Student.User").Preload("Advisor.User").First(&project, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{"error": "Project not found"})
		}
		return c.Status(500).JSON(fiber.Map{
			"error":   "Failed to fetch project",
			"details": err.Error(),
		})
	}

	return c.JSON(project)
}

// GetProjectFiles - GET /api/projects/:id/files
func (h *ProjectHandler) GetProjectFiles(c *fiber.Ctx) error {
	projectId := c.Params("id")
	var files []models.ProjectFile

	query := h.DB.Where("project_id = ?", projectId)

	// Filter by public files only (for public access)
	if c.Query("is_public") == "true" {
		query = query.Where("is_public = ?", true)
	}

	if err := query.Order("uploaded_at DESC").Find(&files).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":   "Failed to fetch files",
			"details": err.Error(),
		})
	}

	return c.JSON(files)
}

// CreateProject - POST /api/projects
func (h *ProjectHandler) CreateProject(c *fiber.Ctx) error {
	type CreateProjectInput struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Category    string `json:"category"`
		DueDate     string `json:"due_date"`
		AdvisorID   string `json:"advisor_id"`
		Type        string `json:"type"`
		StudentID   string `json:"student_id"`
	}

	var input CreateProjectInput

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if input.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Title is required",
		})
	}

	if input.AdvisorID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Advisor is required",
		})
	}

	// Default type if not provided
	if input.Type == "" {
		input.Type = "individual"
	}

	// Default student ID for testing (in real app, get from JWT token)
	studentID := input.StudentID
	if studentID == "" {
		studentID = "4a205330-6ae5-4816-8ab7-6736d1ac9002" // Use actual student UUID from students table
	}

	// Create new project
	project := models.Project{
		Title:       input.Title,
		Description: input.Description,
		StudentID:   studentID,
		Status:      "pending", // Project starts as pending approval
	}

	// Add advisor if provided
	if input.AdvisorID != "" {
		project.AdvisorID = &input.AdvisorID
	}

	if err := h.DB.Create(&project).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to create project",
			"details": err.Error(),
		})
	}

	// Load the created project with relations
	if err := h.DB.Preload("Student.User").Preload("Advisor.User").Where("id = ?", project.ID).First(&project).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to load created project",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(project)
}
