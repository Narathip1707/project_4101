package models

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWT Claims structure
type JWTClaims struct {
	UserID    string  `json:"user_id"`
	Email     string  `json:"email"`
	Role      string  `json:"role"`
	FullName  string  `json:"full_name"`
	StudentID *string `json:"student_id,omitempty"`
	jwt.RegisteredClaims
}

// JWT secret key - in production, this should be from environment variable
var jwtSecret = []byte("your-super-secret-jwt-key-change-in-production")

// GenerateJWT creates a new JWT token for the user
func GenerateJWT(user User) (string, error) {
	// Set expiration time (24 hours)
	expirationTime := time.Now().Add(24 * time.Hour)

	claims := &JWTClaims{
		UserID:    user.ID,
		Email:     user.Email,
		Role:      user.Role,
		FullName:  user.FullName,
		StudentID: &user.StudentID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "project-management-system",
		},
	}

	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Generate encoded token string
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateJWT validates and parses JWT token
func ValidateJWT(tokenString string) (*JWTClaims, error) {
	// Parse token
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	// Extract claims
	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// RefreshJWT creates a new token with extended expiration
func RefreshJWT(tokenString string) (string, error) {
	claims, err := ValidateJWT(tokenString)
	if err != nil {
		return "", err
	}

	// Create new token with extended expiration
	expirationTime := time.Now().Add(24 * time.Hour)
	claims.ExpiresAt = jwt.NewNumericDate(expirationTime)
	claims.IssuedAt = jwt.NewNumericDate(time.Now())

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}
