package models

import (
	"time"

	"gorm.io/gorm"
)

type Student struct {
	ID             string  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	UserID         string  `gorm:"type:uuid;not null"`
	Year           int     `gorm:"not null"`
	GPA            float32 `gorm:"type:decimal(3,2)"`
	AdvisorID      string  `gorm:"type:uuid"`
	EnrollmentYear int
	GraduationYear int
	Status         string    `gorm:"type:varchar(20);default:'active';check:status IN ('active', 'graduated', 'dropped', 'suspended')"`
	CreatedAt      time.Time `gorm:"type:timestamp;autoCreateTime"`
	UpdatedAt      time.Time `gorm:"type:timestamp;autoUpdateTime"`
}

// BeforeSave updates UpdatedAt before saving
func (s *Student) BeforeSave(tx *gorm.DB) (err error) {
	s.UpdatedAt = time.Now()
	return nil
}
