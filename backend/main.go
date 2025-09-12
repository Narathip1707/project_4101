package main

import (
	"backend/models"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func main() {
	//Database configs
	dsn := "host=db user=postgres password=1234 dbname=project_management_system port=5432 sslmode=disable"
	var err error

	log.Println("Connecting to database...")
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Printf("A connection error occurred: %v", err)
		log.Fatal("Unable to connect to the database. Please check your connection settings.")
	}

	// UUID extension
	if err := db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";").Error; err != nil {
		log.Fatal("Unable to create UUID extension:", err)
	}

	//Migrations
	if err := db.AutoMigrate(&models.User{}); err != nil {
		log.Fatal("Unable to migrate database:", err)
	}

	log.Println("Database connected and migrated successfully.")

	//Fiber
	app := fiber.New()
	app.Use(cors.New())

	// Add root route handler
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Welcome to Project Management API",
			"status":  "running",
		})
	})

	// API: Get all users
	app.Get("/api/users", func(c *fiber.Ctx) error {
		var users []models.User
		if err := db.Find(&users).Error; err != nil {
			log.Printf("Error fetching users: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch users"})
		}

		// Hide password hashes
		for i := range users {
			users[i].PasswordHash = ""
		}

		return c.JSON(fiber.Map{
			"data":  users,
			"count": len(users),
		})
	})

	// API: Get user by ID
	app.Get("/api/users/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var user models.User

		if err := db.Where("id = ?", id).First(&user).Error; err != nil {
			log.Printf("User not found: %v", err)
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
		}

		// Hide password hash
		user.PasswordHash = ""

		return c.JSON(fiber.Map{"data": user})
	})

	// API: Get users by role
	app.Get("/api/users/role/:role", func(c *fiber.Ctx) error {
		role := c.Params("role")
		var users []models.User

		if err := db.Where("role = ?", role).Find(&users).Error; err != nil {
			log.Printf("Error fetching users by role: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch users"})
		}

		// Hide password hashes
		for i := range users {
			users[i].PasswordHash = ""
		}

		return c.JSON(fiber.Map{
			"data":  users,
			"count": len(users),
			"role":  role,
		})
	})

	// API: Get system settings
	app.Get("/api/settings", func(c *fiber.Ctx) error {
		var settings []map[string]interface{}

		if err := db.Raw(`
			SELECT setting_key, setting_value, description, created_at, updated_at 
			FROM system_settings
		`).Scan(&settings).Error; err != nil {
			log.Printf("Error fetching settings: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch settings"})
		}

		return c.JSON(fiber.Map{
			"data":  settings,
			"count": len(settings),
		})
	})

	// API: Get user profile (authenticated user info)
	app.Get("/api/profile/:email", func(c *fiber.Ctx) error {
		email := c.Params("email")
		var user models.User

		if err := db.Where("email = ?", email).First(&user).Error; err != nil {
			log.Printf("Profile not found: %v", err)
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Profile not found"})
		}

		// Hide sensitive data
		user.PasswordHash = ""
		user.VerificationToken = ""
		user.PasswordResetToken = ""

		return c.JSON(fiber.Map{"data": user})
	})

	// API: Search users by name or email
	app.Get("/api/users/search", func(c *fiber.Ctx) error {
		query := c.Query("q")
		if query == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Search query is required"})
		}

		var users []models.User
		searchPattern := "%" + query + "%"

		if err := db.Where("full_name ILIKE ? OR email ILIKE ?", searchPattern, searchPattern).Find(&users).Error; err != nil {
			log.Printf("Error searching users: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Search failed"})
		}

		// Hide password hashes
		for i := range users {
			users[i].PasswordHash = ""
		}

		return c.JSON(fiber.Map{
			"data":  users,
			"count": len(users),
			"query": query,
		})
	})

	// API: Get database stats
	app.Get("/api/stats", func(c *fiber.Ctx) error {
		var stats map[string]interface{}

		// Count users by role
		var userCounts []map[string]interface{}
		if err := db.Raw(`
			SELECT role, COUNT(*) as count 
			FROM users 
			GROUP BY role
		`).Scan(&userCounts).Error; err != nil {
			log.Printf("Error fetching user stats: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch stats"})
		}

		// Total users
		var totalUsers int64
		db.Model(&models.User{}).Count(&totalUsers)

		stats = map[string]interface{}{
			"total_users":   totalUsers,
			"users_by_role": userCounts,
		}

		return c.JSON(fiber.Map{"data": stats})
	})

	// API Endpoint: Sign Up
	app.Post("/api/signup", func(c *fiber.Ctx) error {
		// Accept payload matching the frontend form
		var input struct {
			Email      string `json:"email"`
			Password   string `json:"password"`
			FullName   string `json:"fullName"`
			Role       string `json:"role"`
			Phone      string `json:"phone"`
			StudentID  string `json:"studentId"`
			EmployeeID string `json:"employeeId"`
		}

		if err := c.BodyParser(&input); err != nil {
			log.Printf("Sign up body parsing error: %v", err)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
		}

		if input.Email == "" || input.Password == "" || input.FullName == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "email, password and fullName are required"})
		}

		// Basic role default and validation
		role := input.Role
		if role == "" {
			role = "student"
		}
		if role != "student" && role != "advisor" && role != "admin" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid role"})
		}

		// Require ID based on role
		if role == "student" && input.StudentID == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "studentId is required for role student"})
		}
		if role == "advisor" && input.EmployeeID == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "employeeId is required for role advisor"})
		}

		// Hash password before saving
		hashedPassword, err := models.HashPassword(input.Password)
		if err != nil {
			log.Printf("Password hashing error: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to process password"})
		}

		user := models.User{
			Email:        input.Email,
			PasswordHash: hashedPassword,
			FullName:     input.FullName,
			Role:         role,
			Phone:        input.Phone,
			StudentID:    input.StudentID,
			EmployeeID:   input.EmployeeID,
		}

		if err := db.Create(&user).Error; err != nil {
			log.Printf("User creation error: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user"})
		}

		log.Printf("User created successfully: %s", user.Email)
		return c.JSON(fiber.Map{
			"message": "Sign up successful",
			"user": fiber.Map{
				"id":       user.ID,
				"email":    user.Email,
				"fullName": user.FullName,
				"role":     user.Role,
			},
		})
	})

	// API Endpoint: Login
	app.Post("/api/login", func(c *fiber.Ctx) error {
		var input struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		log.Printf("Raw request body: %s", string(c.Body()))

		if err := c.BodyParser(&input); err != nil {
			log.Printf("Login body parsing error: %v", err)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
		}

		log.Printf("Login attempt - Email: %s", input.Email)

		var user models.User
		if err := db.Where("email = ?", input.Email).First(&user).Error; err != nil {
			log.Printf("User lookup error: %v", err)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid email or password"})
		}

		log.Printf("Found user with email: %s", user.Email)

		// Compare password with hash
		if !models.CheckPasswordHash(input.Password, user.PasswordHash) {
			log.Printf("Password mismatch for user: %s", user.Email)
			log.Printf("Provided password: %s", input.Password)
			log.Printf("Stored hash: %s", user.PasswordHash)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid email or password"})
		}

		return c.JSON(fiber.Map{
			"message": "Login successful",
			"user": fiber.Map{
				"id":       user.ID,
				"email":    user.Email,
				"fullName": user.FullName,
				"role":     user.Role,
			},
		})
	})

	// Starting server
	const port = ":8080"
	log.Printf("Server running on http://localhost%s", port)
	log.Fatal(app.Listen(port))
}

func isValidEmail(email string) bool {
	if len(email) < 15 { // "@rumail.ru.ac.th"
		return false
	}
	suffix := "@rumail.ru.ac.th"
	return email[len(email)-len(suffix):] == suffix
}
