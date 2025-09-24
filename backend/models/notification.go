package models

import (
	"time"

	"gorm.io/gorm"
)

type Notification struct {
	ID               string     `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	UserID           string     `gorm:"type:uuid;column:user_id" json:"user_id"`
	Title            string     `gorm:"type:varchar(255);not null" json:"title"`
	Message          string     `gorm:"type:text;not null" json:"message"`
	Type             string     `gorm:"type:varchar(50);default:'info';check:type IN ('info','warning','success','error')" json:"type"`
	Priority         string     `gorm:"type:varchar(20);default:'medium';check:priority IN ('low','medium','high')" json:"priority"`
	IsRead           bool       `gorm:"default:false;column:is_read" json:"is_read"`
	RelatedProjectID *string    `gorm:"type:uuid;column:related_project_id" json:"related_project_id,omitempty"`
	SentAt           time.Time  `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;column:sent_at" json:"sent_at"`
	ReadAt           *time.Time `gorm:"type:timestamp;column:read_at" json:"read_at,omitempty"`
	CreatedAt        time.Time  `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;column:created_at" json:"created_at"`

	// Relationships
	User           *User    `gorm:"foreignKey:UserID" json:"user,omitempty"`
	RelatedProject *Project `gorm:"foreignKey:RelatedProjectID" json:"related_project,omitempty"`
}

func (Notification) TableName() string {
	return "notifications"
}

// BeforeSave updates SentAt before saving
func (n *Notification) BeforeSave(tx *gorm.DB) (err error) {
	if n.SentAt.IsZero() {
		n.SentAt = time.Now()
	}
	return nil
}
