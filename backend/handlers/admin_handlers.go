package handlers

import (
	"backend/models"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AdminHandler struct {
	DB *gorm.DB
}

func NewAdminHandler(db *gorm.DB) *AdminHandler {
	return &AdminHandler{DB: db}
}

// GetUser - Get single user by ID (admin only)
func (h *AdminHandler) GetUser(c *fiber.Ctx) error {
	userID := c.Params("id")

	var user models.User
	if err := h.DB.Preload("Student").Preload("Advisor").Where("id = ?", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "User not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch user",
		})
	}

	return c.JSON(fiber.Map{
		"user": user,
	})
}

// GetUsers - List all users (admin only)
func (h *AdminHandler) GetUsers(c *fiber.Ctx) error {
	var users []models.User

	// Pagination
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	offset := (page - 1) * limit

	// Search by role or email
	role := c.Query("role")
	search := c.Query("search")

	query := h.DB.Preload("Student").Preload("Advisor")

	if role != "" {
		query = query.Where("role = ?", role)
	}

	if search != "" {
		query = query.Where("email ILIKE ? OR full_name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Count total
	var total int64
	query.Model(&models.User{}).Count(&total)

	// Get users with pagination
	if err := query.Limit(limit).Offset(offset).Find(&users).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch users",
		})
	}

	// Remove password hashes
	for i := range users {
		users[i].PasswordHash = ""
	}

	return c.JSON(fiber.Map{
		"users": users,
		"pagination": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
			"pages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

// CreateUser - Create new user (admin only)
func (h *AdminHandler) CreateUser(c *fiber.Ctx) error {
	var input struct {
		Email      string `json:"email" validate:"required,email"`
		Password   string `json:"password" validate:"required,min=6"`
		FullName   string `json:"full_name" validate:"required"`
		Role       string `json:"role" validate:"required,oneof=student advisor admin"`
		Department string `json:"department"`
		Phone      string `json:"phone"`
		StudentID  string `json:"student_id"`
		EmployeeID string `json:"employee_id"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if input.Email == "" || input.Password == "" || input.FullName == "" || input.Role == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Email, password, full name, and role are required",
		})
	}

	// Check if email already exists
	var existingUser models.User
	if err := h.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Email already exists",
		})
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to hash password",
		})
	}

	// Create user
	user := models.User{
		Email:        input.Email,
		PasswordHash: string(hashedPassword),
		FullName:     input.FullName,
		Role:         input.Role,
		Department:   input.Department,
		Phone:        input.Phone,
		StudentID:    input.StudentID,
		EmployeeID:   input.EmployeeID,
		IsVerified:   true, // Admin created users are verified
	}

	if err := h.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create user",
		})
	}

	// Create role-specific record
	if user.Role == "student" {
		student := models.Student{
			UserID: user.ID,
			Year:   1, // Default year
			Status: "active",
		}
		h.DB.Create(&student)
	} else if user.Role == "advisor" {
		advisor := models.Advisor{
			UserID:         user.ID,
			Title:          "อ.",       // Default title
			MaxStudents:    5,          // Default max students
			Specialization: []string{}, // Empty specialization
		}
		h.DB.Create(&advisor)
	}

	// Don't return password hash
	user.PasswordHash = ""

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "User created successfully",
		"user":    user,
	})
}

// UpdateUser - Update user (admin only)
func (h *AdminHandler) UpdateUser(c *fiber.Ctx) error {
	userID := c.Params("id")

	var input struct {
		FullName   string `json:"full_name"`
		Role       string `json:"role"`
		Department string `json:"department"`
		Phone      string `json:"phone"`
		StudentID  string `json:"student_id"`
		EmployeeID string `json:"employee_id"`
		IsVerified *bool  `json:"is_verified"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	var user models.User
	if err := h.DB.First(&user, "id = ?", userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Update fields
	if input.FullName != "" {
		user.FullName = input.FullName
	}
	if input.Role != "" && (input.Role == "student" || input.Role == "advisor" || input.Role == "admin") {
		user.Role = input.Role
	}
	if input.Department != "" {
		user.Department = input.Department
	}
	if input.Phone != "" {
		user.Phone = input.Phone
	}
	if input.StudentID != "" {
		user.StudentID = input.StudentID
	}
	if input.EmployeeID != "" {
		user.EmployeeID = input.EmployeeID
	}
	if input.IsVerified != nil {
		user.IsVerified = *input.IsVerified
	}

	if err := h.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update user",
		})
	}

	// Don't return password hash
	user.PasswordHash = ""

	return c.JSON(fiber.Map{
		"message": "User updated successfully",
		"user":    user,
	})
}

// DeleteUser - Delete user (admin only)
func (h *AdminHandler) DeleteUser(c *fiber.Ctx) error {
	userID := c.Params("id")

	// Prevent admin from deleting themselves
	currentUser := c.Locals("user").(*models.JWTClaims)
	if currentUser.UserID == userID {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot delete your own account",
		})
	}

	var user models.User
	if err := h.DB.First(&user, "id = ?", userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Delete user (cascade will handle related records)
	if err := h.DB.Delete(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete user",
		})
	}

	return c.JSON(fiber.Map{
		"message": "User deleted successfully",
	})
}

// ResetPassword - Reset user password (admin only)
func (h *AdminHandler) ResetPassword(c *fiber.Ctx) error {
	userID := c.Params("id")

	var input struct {
		Password string `json:"password" validate:"required,min=6"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if input.Password == "" || len(input.Password) < 6 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Password must be at least 6 characters",
		})
	}

	var user models.User
	if err := h.DB.First(&user, "id = ?", userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to hash password",
		})
	}

	user.PasswordHash = string(hashedPassword)

	if err := h.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update password",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Password reset successfully",
	})
}

// GetUserStats - Get user statistics (admin only)
func (h *AdminHandler) GetUserStats(c *fiber.Ctx) error {
	var stats struct {
		TotalUsers    int64 `json:"total_users"`
		Students      int64 `json:"students"`
		Advisors      int64 `json:"advisors"`
		Admins        int64 `json:"admins"`
		VerifiedUsers int64 `json:"verified_users"`
	}

	h.DB.Model(&models.User{}).Count(&stats.TotalUsers)
	h.DB.Model(&models.User{}).Where("role = ?", "student").Count(&stats.Students)
	h.DB.Model(&models.User{}).Where("role = ?", "advisor").Count(&stats.Advisors)
	h.DB.Model(&models.User{}).Where("role = ?", "admin").Count(&stats.Admins)
	h.DB.Model(&models.User{}).Where("is_verified = ?", true).Count(&stats.VerifiedUsers)

	return c.JSON(stats)
}

// GetProjects - List all projects (admin only)
func (h *AdminHandler) GetProjects(c *fiber.Ctx) error {
	type ProjectResponse struct {
		ID           string `json:"id"`
		Title        string `json:"title"`
		Description  string `json:"description"`
		Status       string `json:"status"`
		StudentID    string `json:"student_id"`
		StudentName  string `json:"student_name"`
		AdvisorID    string `json:"advisor_id"`
		AdvisorName  string `json:"advisor_name"`
		CreatedAt    string `json:"created_at"`
		UpdatedAt    string `json:"updated_at"`
	}

	// Pagination
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	offset := (page - 1) * limit

	// Filters
	search := c.Query("search")
	status := c.Query("status")

	// Build query
	query := h.DB.Model(&models.Project{}).
		Joins("LEFT JOIN students ON projects.student_id = students.id").
		Joins("LEFT JOIN users AS student_users ON students.user_id = student_users.id").
		Joins("LEFT JOIN advisors ON projects.advisor_id = advisors.id").
		Joins("LEFT JOIN users AS advisor_users ON advisors.user_id = advisor_users.id").
		Select(`
			projects.id,
			projects.title,
			projects.description,
			projects.status,
			student_users.student_id,
			student_users.full_name as student_name,
			advisor_users.employee_id as advisor_id,
			advisor_users.full_name as advisor_name,
			projects.created_at,
			projects.updated_at
		`)

	// Apply filters
	if search != "" {
		query = query.Where(`
			projects.title LIKE ? OR
			projects.description LIKE ? OR
			student_users.full_name LIKE ? OR
			advisor_users.full_name LIKE ?
		`, "%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	if status != "" {
		query = query.Where("projects.status = ?", status)
	}

	// Get total count
	var total int64
	countQuery := h.DB.Model(&models.Project{})
	if search != "" {
		countQuery = countQuery.
			Joins("LEFT JOIN students ON projects.student_id = students.id").
			Joins("LEFT JOIN users AS student_users ON students.user_id = student_users.id").
			Joins("LEFT JOIN advisors ON projects.advisor_id = advisors.id").
			Joins("LEFT JOIN users AS advisor_users ON advisors.user_id = advisor_users.id").
			Where(`
				projects.title LIKE ? OR
				projects.description LIKE ? OR
				student_users.full_name LIKE ? OR
				advisor_users.full_name LIKE ?
			`, "%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	if status != "" {
		countQuery = countQuery.Where("status = ?", status)
	}
	countQuery.Count(&total)

	// Get projects
	var projects []ProjectResponse
	if err := query.
		Order("projects.created_at DESC").
		Limit(limit).
		Offset(offset).
		Scan(&projects).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch projects",
		})
	}

	// Calculate pagination
	totalPages := int(total) / limit
	if int(total)%limit > 0 {
		totalPages++
	}

	return c.JSON(fiber.Map{
		"projects": projects,
		"pagination": fiber.Map{
			"page":   page,
			"limit":  limit,
			"total":  total,
			"pages":  totalPages,
		},
	})
}

// DeleteProject - Delete a project (admin only)
func (h *AdminHandler) DeleteProject(c *fiber.Ctx) error {
	projectID := c.Params("id")

	// Check if project exists
	var project models.Project
	if err := h.DB.First(&project, "id = ?", projectID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Project not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to check project",
		})
	}

	// Delete related records first (files, notifications, etc.)
	// Delete project files
	h.DB.Where("project_id = ?", projectID).Delete(&models.ProjectFile{})
	
	// Delete notifications related to this project
	h.DB.Where("project_id = ?", projectID).Delete(&models.Notification{})

	// Delete the project
	if err := h.DB.Delete(&project).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete project",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Project deleted successfully",
	})
}
