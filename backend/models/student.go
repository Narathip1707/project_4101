package models

import (
	"time"
)

type Student struct {
	ID             string    `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	UserID         string    `gorm:"type:uuid;column:user_id" json:"user_id"`
	Year           int       `gorm:"not null" json:"year"`
	GPA            *float64  `gorm:"type:decimal(3,2)" json:"gpa,omitempty"`
	AdvisorID      *string   `gorm:"type:uuid;column:advisor_id" json:"advisor_id,omitempty"`
	EnrollmentYear *int      `gorm:"column:enrollment_year" json:"enrollment_year,omitempty"`
	GraduationYear *int      `gorm:"column:graduation_year" json:"graduation_year,omitempty"`
	Status         string    `gorm:"type:varchar(20);default:'active';check:status IN ('active','graduated','dropped','suspended')" json:"status"`
	CreatedAt      time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;column:created_at" json:"created_at"`
	UpdatedAt      time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;column:updated_at" json:"updated_at"`

	// Relationships
	User     *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Advisor  *Advisor  `gorm:"foreignKey:AdvisorID" json:"advisor,omitempty"`
	Projects []Project `gorm:"foreignKey:StudentID" json:"projects,omitempty"`
}

func (Student) TableName() string {
	return "students"
}
