package models

import (
	"time"

	"gorm.io/gorm"
)

type Project struct {
	ID              string    `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	StudentID       string    `gorm:"type:uuid;not null"`
	AdvisorID       string    `gorm:"type:uuid"`
	Title           string    `gorm:"type:varchar(500);not null"`
	Description     string    `gorm:"type:text"`
	Objectives      string    `gorm:"type:text"`
	Scope           string    `gorm:"type:text"`
	Methodology     string    `gorm:"type:text"`
	ExpectedOutcome string    `gorm:"type:text"`
	Keywords        []string  `gorm:"type:text[]"`
	Status          string    `gorm:"type:varchar(20);default:'proposal';check:status IN ('proposal', 'approved', 'in_progress', 'completed', 'cancelled')"`
	StartDate       time.Time `gorm:"type:date"`
	ExpectedEndDate time.Time `gorm:"type:date"`
	ActualEndDate   time.Time `gorm:"type:date"`
	Grade           string    `gorm:"type:varchar(5)"`
	CreatedAt       time.Time `gorm:"type:timestamp;autoCreateTime"`
	UpdatedAt       time.Time `gorm:"type:timestamp;autoUpdateTime"`
}

// BeforeSave updates UpdatedAt before saving
func (p *Project) BeforeSave(tx *gorm.DB) (err error) {
	p.UpdatedAt = time.Now()
	return nil
}
