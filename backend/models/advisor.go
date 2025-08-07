package models

import (
	"time"

	"gorm.io/gorm"
)

type Advisor struct {
	ID                string         `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	UserID            string         `gorm:"type:uuid;not null"`
	Title             string         `gorm:"type:varchar(50);not null"`
	Specialization    []string       `gorm:"type:text[]"`
	ResearchInterests string         `gorm:"type:text"`
	OfficeLocation    string         `gorm:"type:varchar(100)"`
	OfficeHours       string         `gorm:"type:text"`
	MaxStudents       int            `gorm:"default:5" validate:"required,min=1,max=10"`
	CurrentStudents   int            `gorm:"default:0" validate:"min=0"`
	Bio               string         `gorm:"type:text"`
	CreatedAt         time.Time      `gorm:"type:timestamp;autoCreateTime"`
	UpdatedAt         time.Time      `gorm:"type:timestamp;autoUpdateTime"`
	DeletedAt         gorm.DeletedAt `gorm:"index"`

	// Relationships
	User     *User     `gorm:"foreignKey:UserID"`
	Students []Student `gorm:"foreignKey:AdvisorID"`
	Projects []Project `gorm:"foreignKey:AdvisorID"`
}

// BeforeSave updates UpdatedAt before saving
func (a *Advisor) BeforeSave(tx *gorm.DB) (err error) {
	a.UpdatedAt = time.Now()
	return nil
}
