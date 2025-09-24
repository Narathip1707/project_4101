package models

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Advisor struct {
	ID                string         `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	UserID            string         `gorm:"type:uuid;column:user_id" json:"user_id"`
	Title             string         `gorm:"type:varchar(50);not null" json:"title"`
	Specialization    pq.StringArray `gorm:"type:text[]" json:"specialization"`
	ResearchInterests string         `gorm:"type:text;column:research_interests" json:"research_interests,omitempty"`
	OfficeLocation    string         `gorm:"type:varchar(100);column:office_location" json:"office_location,omitempty"`
	OfficeHours       string         `gorm:"type:text;column:office_hours" json:"office_hours,omitempty"`
	MaxStudents       int            `gorm:"default:5;column:max_students" json:"max_students"`
	CurrentStudents   int            `gorm:"default:0;column:current_students" json:"current_students"`
	Bio               string         `gorm:"type:text" json:"bio,omitempty"`
	CreatedAt         time.Time      `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;column:created_at" json:"created_at"`
	UpdatedAt         time.Time      `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;column:updated_at" json:"updated_at"`

	// Relationships
	User     *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Students []Student `gorm:"foreignKey:AdvisorID" json:"students,omitempty"`
	Projects []Project `gorm:"foreignKey:AdvisorID" json:"projects,omitempty"`
}

func (Advisor) TableName() string {
	return "advisors"
}

// BeforeSave updates UpdatedAt before saving
func (a *Advisor) BeforeSave(tx *gorm.DB) (err error) {
	a.UpdatedAt = time.Now()
	return nil
}
