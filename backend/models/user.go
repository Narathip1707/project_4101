package models

import (
	"time" // เพิ่ม import time

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID                   string    `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	Email                string    `gorm:"type:varchar(255);unique;not null"`
	PasswordHash         string    `gorm:"type:varchar(255);not null"`
	FullName             string    `gorm:"type:varchar(255);not null"`
	StudentID            string    `gorm:"type:varchar(20)"`
	EmployeeID           string    `gorm:"type:varchar(20)"`
	Role                 string    `gorm:"type:varchar(20);not null;check:role IN ('student', 'advisor', 'admin')"`
	Department           string    `gorm:"type:varchar(100);default:'วิทยาการคอมพิวเตอร์'"`
	Phone                string    `gorm:"type:varchar(20)"`
	IsVerified           bool      `gorm:"default:false"`
	VerificationToken    string    `gorm:"type:varchar(255)"`
	PasswordResetToken   string    `gorm:"type:varchar(255)"`
	PasswordResetExpires time.Time `gorm:"type:timestamp"`
	ProfileImage         string    `gorm:"type:text"`
	CreatedAt            time.Time `gorm:"type:timestamp;autoCreateTime"`
	UpdatedAt            time.Time `gorm:"type:timestamp;autoUpdateTime"`
	Password             string    `gorm:"-"` // Temporary field for password handling
}

// BeforeCreate handles password hashing before saving to database
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.Password != "" {
		hashedPassword, err := HashPassword(u.Password)
		if err != nil {
			return err
		}
		u.PasswordHash = hashedPassword
		u.Password = ""
	}
	return nil
}

// HashPassword converts a plain text password into a hashed version
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash verifies if the password matches the hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// BeforeSave updates UpdatedAt before saving
func (u *User) BeforeSave(tx *gorm.DB) (err error) {
	u.UpdatedAt = time.Now()
	return nil
}
