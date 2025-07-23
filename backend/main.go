package main

import (
	"database/sql"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors" // Import CORS middleware
	_ "github.com/lib/pq"
)

type Project struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Author      string `json:"author"`
	CreatedAt   string `json:"created_at"`
}

func main() {
	// Connect to PostgreSQL
	connStr := "host=localhost port=5432 user=postgres password=1234 dbname=project_4101_db sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Initialize Fiber
	app := fiber.New()

	// Apply CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000", // Allow frontend origin
		AllowMethods: "GET,POST,PUT,DELETE",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// Add root route
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Welcome to University Project Showcase API!")
	})

	// CRUD Routes
	// Create
	app.Post("/api/projects", func(c *fiber.Ctx) error {
		var project Project
		if err := c.BodyParser(&project); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Cannot parse JSON"})
		}
		query := `INSERT INTO projects (title, description, author) VALUES ($1, $2, $3) RETURNING id, created_at`
		err := db.QueryRow(query, project.Title, project.Description, project.Author).Scan(&project.ID, &project.CreatedAt)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Cannot create project"})
		}
		return c.JSON(project)
	})

	// Read All
	app.Get("/api/projects", func(c *fiber.Ctx) error {
		rows, err := db.Query("SELECT id, title, description, author, created_at FROM projects")
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Cannot fetch projects"})
		}
		defer rows.Close()

		projects := []Project{}
		for rows.Next() {
			var p Project
			if err := rows.Scan(&p.ID, &p.Title, &p.Description, &p.Author, &p.CreatedAt); err != nil {
				return c.Status(500).JSON(fiber.Map{"error": "Cannot scan project"})
			}
			projects = append(projects, p)
		}
		return c.JSON(projects)
	})

	// Read One
	app.Get("/api/projects/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var project Project
		query := `SELECT id, title, description, author, created_at FROM projects WHERE id = $1`
		err := db.QueryRow(query, id).Scan(&project.ID, &project.Title, &project.Description, &project.Author, &project.CreatedAt)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Project not found"})
		}
		return c.JSON(project)
	})

	// Update
	app.Put("/api/projects/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var project Project
		if err := c.BodyParser(&project); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Cannot parse JSON"})
		}
		query := `UPDATE projects SET title = $1, description = $2, author = $3 WHERE id = $4`
		_, err := db.Exec(query, project.Title, project.Description, project.Author, id)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Cannot update project"})
		}
		return c.JSON(fiber.Map{"message": "Project updated"})
	})

	// Delete
	app.Delete("/api/projects/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		query := `DELETE FROM projects WHERE id = $1`
		result, err := db.Exec(query, id)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Cannot delete project"})
		}
		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			return c.Status(404).JSON(fiber.Map{"error": "Project not found"})
		}
		return c.JSON(fiber.Map{"message": "Project deleted"})
	})

	app.Use(cors.New())
	// Start server
	log.Fatal(app.Listen(":3001"))
}
