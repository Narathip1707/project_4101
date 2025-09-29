package middlewares

import (
	"backend/models"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// JWTMiddleware validates JWT token and sets user context
func JWTMiddleware(c *fiber.Ctx) error {
	// Get Authorization header
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Missing authorization header",
		})
	}

	// Check if header starts with "Bearer "
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid authorization header format",
		})
	}

	// Extract token
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	// Validate token
	claims, err := models.ValidateJWT(tokenString)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid or expired token",
		})
	}

	// Set user context
	c.Locals("user", claims)
	c.Locals("user_id", claims.UserID)
	c.Locals("user_email", claims.Email)
	c.Locals("user_role", claims.Role)

	return c.Next()
}

// OptionalJWTMiddleware validates JWT token if present, but doesn't require it
func OptionalJWTMiddleware(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Next()
	}

	if !strings.HasPrefix(authHeader, "Bearer ") {
		return c.Next()
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := models.ValidateJWT(tokenString)
	if err != nil {
		return c.Next() // Continue without setting user context
	}

	// Set user context if token is valid
	c.Locals("user", claims)
	c.Locals("user_id", claims.UserID)
	c.Locals("user_email", claims.Email)
	c.Locals("user_role", claims.Role)

	return c.Next()
}

// AdminMiddleware checks if user has admin role
func AdminMiddleware(c *fiber.Ctx) error {
	user := c.Locals("user")
	if user == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Authentication required",
		})
	}

	claims, ok := user.(*models.JWTClaims)
	if !ok || claims.Role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Admin access required",
		})
	}

	return c.Next()
}

// AdvisorMiddleware checks if user has advisor role or higher
func AdvisorMiddleware(c *fiber.Ctx) error {
	user := c.Locals("user")
	if user == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Authentication required",
		})
	}

	claims, ok := user.(*models.JWTClaims)
	if !ok || (claims.Role != "advisor" && claims.Role != "admin") {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Advisor access required",
		})
	}

	return c.Next()
}
