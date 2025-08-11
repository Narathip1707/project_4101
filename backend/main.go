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

	// API Endpoint: Sign Up
	app.Post("/api/signup", func(c *fiber.Ctx) error {
		var user models.User
		if err := c.BodyParser(&user); err != nil {
			log.Printf("Sign up body parsing error: %v", err)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
		}

		// Store plain password temporarily
		plainPassword := user.PasswordHash

		// Hash password before saving
		hashedPassword, err := models.HashPassword(plainPassword)
		if err != nil {
			log.Printf("Password hashing error: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to process password"})
		}
		user.PasswordHash = hashedPassword
		user.Role = "student" // Default role

		if err := db.Create(&user).Error; err != nil {
			log.Printf("User creation error: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user"})
		}

		log.Printf("User created successfully: %s", user.Email)
		return c.JSON(fiber.Map{"message": "Sign up successful", "user": user})
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
