package models

import (
	"time"

	"gorm.io/gorm"
)

type Student struct {
	ID             string  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	UserID         string  `gorm:"type:uuid;not null"`
	Year           int     `gorm:"not null" validate:"required,min=1,max=4"`
	GPA            float32 `gorm:"type:decimal(3,2)" validate:"min=0,max=4.00"`
	AdvisorID      string  `gorm:"type:uuid"`
	EnrollmentYear int
	GraduationYear int
	Status         string         `gorm:"type:varchar(20);default:'active';check:status IN ('active', 'graduated', 'dropped', 'suspended')"`
	CreatedAt      time.Time      `gorm:"type:timestamp;autoCreateTime"`
	UpdatedAt      time.Time      `gorm:"type:timestamp;autoUpdateTime"`
	DeletedAt      gorm.DeletedAt `gorm:"index"`

	// เพิ่ม relationships
	User     *User     `gorm:"foreignKey:UserID"`
	Advisor  *Advisor  `gorm:"foreignKey:AdvisorID"`
	Projects []Project `gorm:"foreignKey:StudentID"`
}

// BeforeSave updates UpdatedAt before saving
func (s *Student) BeforeSave(tx *gorm.DB) (err error) {
	s.UpdatedAt = time.Now()
	return nil
}
