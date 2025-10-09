package handlers

import (
	"backend/models"
	"log"
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

	log.Printf("GetProjects - UserID: %s, Role: %s", userID, userRole)

	switch userRole {
	case "student":
		// Students can only see their own projects
		// First get student record from user_id
		var student models.Student
		if err := h.DB.Where("user_id = ?", userID).First(&student).Error; err != nil {
			log.Printf("Student record not found for user_id: %s", userID)
			// Return empty list if no student record
			return c.JSON(fiber.Map{
				"data":  []models.Project{},
				"total": 0,
				"page":  1,
				"limit": 10,
			})
		}
		log.Printf("Applying student filter - student_id = %s (from user_id = %s)", student.ID, userID)
		query = query.Where("student_id = ?", student.ID)
	case "advisor":
		// Advisors can see projects they are assigned to
		// First get advisor record from user_id
		var advisor models.Advisor
		if err := h.DB.Where("user_id = ?", userID).First(&advisor).Error; err != nil {
			log.Printf("Advisor record not found for user_id: %s", userID)
			// Return empty list if no advisor record
			return c.JSON(fiber.Map{
				"data":  []models.Project{},
				"total": 0,
				"page":  1,
				"limit": 10,
			})
		}
		log.Printf("Applying advisor filter - advisor_id = %s (from user_id = %s)", advisor.ID, userID)
		query = query.Where("advisor_id = ?", advisor.ID)
	case "admin":
		// Admins can see all projects (no additional filter)
		log.Printf("Admin access - no filter applied")
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

	if err := query.Order("created_at DESC").Find(&files).Error; err != nil {
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

	// Get user ID from JWT token
	userID, ok := c.Locals("user_id").(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "User not authenticated",
		})
	}

	// Get student record from user_id
	var student models.Student
	if err := h.DB.Where("user_id = ?", userID).First(&student).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Student record not found. Please contact admin.",
		})
	}

	// Create new project
	project := models.Project{
		Title:       input.Title,
		Description: input.Description,
		StudentID:   student.ID, // ใช้ student.ID จากตาราง students
		Status:      "pending",  // Project starts as pending approval
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
