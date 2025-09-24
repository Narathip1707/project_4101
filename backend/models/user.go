package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID                   string     `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Email                string     `gorm:"type:varchar(255);unique;not null" json:"email"`
	PasswordHash         string     `gorm:"type:varchar(255);not null" json:"-"`
	Password             string     `gorm:"-" json:"-"` // Used for input, not stored
	FullName             string     `gorm:"type:varchar(255);not null;column:full_name" json:"full_name"`
	StudentID            string     `gorm:"type:varchar(20);column:student_id" json:"student_id,omitempty"`
	EmployeeID           string     `gorm:"type:varchar(20);column:employee_id" json:"employee_id,omitempty"`
	Role                 string     `gorm:"type:varchar(20);not null;check:role IN ('student','advisor','admin')" json:"role"`
	Department           string     `gorm:"type:varchar(100);default:'วิทยาการคอมพิวเตอร์'" json:"department"`
	Phone                string     `gorm:"type:varchar(20)" json:"phone"`
	IsVerified           bool       `gorm:"type:boolean;default:false;column:is_verified" json:"is_verified"`
	VerificationToken    string     `gorm:"type:varchar(255);column:verification_token" json:"-"`
	PasswordResetToken   string     `gorm:"type:varchar(255);column:password_reset_token" json:"-"`
	PasswordResetExpires *time.Time `gorm:"type:timestamp;column:password_reset_expires" json:"-"`
	ProfileImage         string     `gorm:"type:text;column:profile_image" json:"profile_image,omitempty"`
	CreatedAt            time.Time  `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;column:created_at" json:"created_at"`
	UpdatedAt            time.Time  `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;column:updated_at" json:"updated_at"`

	// Relationships
	Student *Student `gorm:"foreignKey:UserID" json:"student,omitempty"`
	Advisor *Advisor `gorm:"foreignKey:UserID" json:"advisor,omitempty"`

	// Soft delete - ไม่ใช้เนื่องจาก schema ไม่มี
	// DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeCreate handles password hashing before saving to database
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.Password != "" {
		hashed, err := HashPassword(u.Password)
		if err != nil {
			return err
		}
		u.PasswordHash = hashed
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
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

// TableName specifies the table name
func (User) TableName() string {
	return "users"
}
