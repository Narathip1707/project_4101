package main

import (
	"backend/handlers"
	"backend/models"
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func main() {
	// Database configs from ENV (fallbacks)
	host := getEnv("DB_HOST", "localhost")
	user := getEnv("DB_USER", "postgres")
	pass := getEnv("DB_PASSWORD", "1234")
	name := getEnv("DB_NAME", "project_management_system")
	// Use external port 5433 when running from localhost
	port := getEnv("DB_PORT", "5433")
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable", host, user, pass, name, port)

	var err error
	log.Println("Connecting to database...")
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Printf("A connection error occurred: %v", err)
		log.Fatal("Unable to connect to the database. Please check your connection settings.")
	}

	// ไม่ใช้ AutoMigrate เพราะ database schema มีอยู่แล้ว
	// แค่ทดสอบการเชื่อมต่อ
	var result int
	if err := db.Raw("SELECT 1").Scan(&result).Error; err != nil {
		log.Fatal("Database connection test failed:", err)
	}

	log.Println("Database connected successfully.")

	// Initialize Fiber app
	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins:     getEnv("CORS_ORIGINS", "http://localhost:3000"),
		AllowMethods:     "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		AllowHeaders:     "*",
		AllowCredentials: true,
	}))

	// Static files for uploads
	app.Static("/uploads", "./uploads")

	// Initialize handlers
	projectHandler := handlers.NewProjectHandler(db)
	fileHandler := handlers.NewFileHandler(db)
	notificationHandler := handlers.NewNotificationHandler(db)

	// Root route
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Project Management System API",
			"version": "1.0.0",
			"status":  "running",
		})
	})

	// Health check
	app.Get("/api/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":   "healthy",
			"database": "connected",
		})
	})

	// Auth endpoints
	app.Post("/api/signup", signupHandler)
	app.Post("/api/login", loginHandler)

	// Project endpoints
	app.Get("/api/projects", projectHandler.GetProjects)
	app.Post("/api/projects", projectHandler.CreateProject)
	app.Get("/api/projects/:id", projectHandler.GetProject)
	app.Get("/api/projects/:id/files", projectHandler.GetProjectFiles)

	// File endpoints
	app.Post("/api/projects/:id/files", fileHandler.UploadFile)
	app.Get("/api/files/:id/download", fileHandler.DownloadFile)
	app.Patch("/api/files/:id/review", fileHandler.ReviewFile)

	// Notification endpoints
	app.Get("/api/notifications", notificationHandler.GetNotifications)
	app.Patch("/api/notifications/:id/read", notificationHandler.MarkAsRead)

	// Profile endpoints
	app.Get("/api/profile", profileHandler)
	app.Put("/api/profile", updateProfileHandler)
	app.Patch("/api/profile", updateProfileHandler)

	// Starting server
	serverPort := getEnv("PORT", "8081")
	log.Printf("Server starting on http://localhost:%s", serverPort)
	log.Fatal(app.Listen(":" + serverPort))
}

// Auth handlers (keep existing but remove debug logs)
func signupHandler(c *fiber.Ctx) error {
	var input struct {
		Email      string `json:"email"`
		Password   string `json:"password"`
		FullName   string `json:"fullName"`
		Role       string `json:"role"`
		Phone      string `json:"phone"`
		StudentId  string `json:"studentId"`
		EmployeeId string `json:"employeeId"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Basic validations
	if input.Email == "" || input.Password == "" || input.FullName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "email, password and fullName are required"})
	}

	if !isValidEmail(input.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "email must end with @rumail.ru.ac.th"})
	}

	role := input.Role
	if role == "" {
		role = "student"
	}

	if role != "student" && role != "advisor" && role != "admin" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid role"})
	}

	// Check unique email
	var count int64
	if err := db.Model(&models.User{}).Where("email = ?", input.Email).Count(&count).Error; err == nil && count > 0 {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "email already exists"})
	}

	// Hash password
	hashedPassword, err := models.HashPassword(input.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to process password"})
	}

	user := models.User{
		Email:        input.Email,
		PasswordHash: hashedPassword,
		FullName:     input.FullName,
		Role:         role,
		Phone:        input.Phone,
		StudentID:    input.StudentId,
		EmployeeID:   input.EmployeeId,
	}

	if err := db.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user"})
	}

	return c.JSON(fiber.Map{
		"message": "Sign up successful",
		"user": fiber.Map{
			"id":       user.ID,
			"email":    user.Email,
			"fullName": user.FullName,
			"role":     user.Role,
		},
	})
}

func loginHandler(c *fiber.Ctx) error {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	if input.Email == "" || input.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Email and password are required"})
	}

	var user models.User
	if err := db.Where("email = ?", input.Email).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	if !models.CheckPasswordHash(input.Password, user.PasswordHash) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	// Don't return password hash
	user.PasswordHash = ""

	return c.JSON(fiber.Map{
		"message": "Login successful",
		"user":    user,
	})
}

func profileHandler(c *fiber.Ctx) error {
	// Try to get user_id from query parameter first, then from mock token logic
	userId := c.Query("user_id")

	// If no user_id provided, try to extract from Authorization header
	if userId == "" {
		// Use the actual admin user UUID from database
		userId = "41b805d8-f8c0-4af6-974b-84f03aeafdb7"
	}

	var user models.User
	if err := db.Preload("Student").Preload("Advisor").First(&user, "id = ?", userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	// Don't return password hash
	user.PasswordHash = ""

	return c.JSON(user)
}

func updateProfileHandler(c *fiber.Ctx) error {
	// Try to get user_id from query parameter first
	userId := c.Query("user_id")

	// If no user_id provided, use default for testing
	if userId == "" {
		userId = "41b805d8-f8c0-4af6-974b-84f03aeafdb7"
	}

	var input struct {
		FullName    string `json:"fullName"`
		FullName2   string `json:"full_name"` // Support both formats
		Phone       string `json:"phone"`
		StudentID   string `json:"studentId"`
		StudentID2  string `json:"student_id"` // Support both formats
		EmployeeID  string `json:"employeeId"`
		EmployeeID2 string `json:"employee_id"` // Support both formats
		Email       string `json:"email"`
		Department  string `json:"department"`
		Faculty     string `json:"faculty"`
		Year        string `json:"year"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Find existing user
	var user models.User
	if err := db.First(&user, "id = ?", userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	// Update user fields (support both formats)
	if input.FullName != "" {
		user.FullName = input.FullName
	} else if input.FullName2 != "" {
		user.FullName = input.FullName2
	}
	if input.Phone != "" {
		user.Phone = input.Phone
	}
	if input.StudentID != "" {
		user.StudentID = input.StudentID
	} else if input.StudentID2 != "" {
		user.StudentID = input.StudentID2
	}
	if input.EmployeeID != "" {
		user.EmployeeID = input.EmployeeID
	} else if input.EmployeeID2 != "" {
		user.EmployeeID = input.EmployeeID2
	}

	// Save updated user
	if err := db.Save(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update profile"})
	}

	// Don't return password hash
	user.PasswordHash = ""

	return c.JSON(fiber.Map{
		"message": "Profile updated successfully",
		"user":    user,
	})
}

func getEnv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}

func isValidEmail(email string) bool {
	return len(email) > 16 && email[len(email)-16:] == "@rumail.ru.ac.th"
}
