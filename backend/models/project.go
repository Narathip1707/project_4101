package models

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Project struct {
	ID              string         `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	StudentID       string         `gorm:"type:uuid;column:student_id" json:"student_id"`
	AdvisorID       *string        `gorm:"type:uuid;column:advisor_id" json:"advisor_id,omitempty"`
	Title           string         `gorm:"type:varchar(500);not null" json:"title"`
	Description     string         `gorm:"type:text" json:"description,omitempty"`
	Objectives      string         `gorm:"type:text" json:"objectives,omitempty"`
	Scope           string         `gorm:"type:text" json:"scope,omitempty"`
	Methodology     string         `gorm:"type:text" json:"methodology,omitempty"`
	ExpectedOutcome string         `gorm:"type:text;column:expected_outcome" json:"expected_outcome,omitempty"`
	Keywords        pq.StringArray `gorm:"type:text[]" json:"keywords"`
	Status          string         `gorm:"type:varchar(20);default:'proposal';check:status IN ('proposal','approved','in_progress','completed','cancelled')" json:"status"`
	StartDate       *time.Time     `gorm:"type:date;column:start_date" json:"start_date,omitempty"`
	ExpectedEndDate *time.Time     `gorm:"type:date;column:expected_end_date" json:"expected_end_date,omitempty"`
	ActualEndDate   *time.Time     `gorm:"type:date;column:actual_end_date" json:"actual_end_date,omitempty"`
	Grade           string         `gorm:"type:varchar(5)" json:"grade,omitempty"`
	CreatedAt       time.Time      `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;column:created_at" json:"created_at"`
	UpdatedAt       time.Time      `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;column:updated_at" json:"updated_at"`

	// Relationships
	Student      *Student      `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	Advisor      *Advisor      `gorm:"foreignKey:AdvisorID" json:"advisor,omitempty"`
	ProjectFiles []ProjectFile `gorm:"foreignKey:ProjectID" json:"project_files,omitempty"`
}

func (Project) TableName() string {
	return "projects"
}

// BeforeSave updates UpdatedAt before saving
func (p *Project) BeforeSave(tx *gorm.DB) (err error) {
	p.UpdatedAt = time.Now()
	return nil
}
