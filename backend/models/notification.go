package models

import (
	"time"

	"gorm.io/gorm"
)

type Notification struct {
	ID               string    `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	UserID           string    `gorm:"type:uuid;not null"`
	Title            string    `gorm:"type:varchar(255);not null"`
	Message          string    `gorm:"type:text;not null"`
	Type             string    `gorm:"type:varchar(50);default:'info';check:type IN ('info', 'warning', 'success', 'error')"`
	Priority         string    `gorm:"type:varchar(20);default:'medium';check:priority IN ('low', 'medium', 'high')"`
	IsRead           bool      `gorm:"default:false"`
	RelatedProjectID string    `gorm:"type:uuid"`
	SentAt           time.Time `gorm:"type:timestamp;autoCreateTime"`
	ReadAt           time.Time `gorm:"type:timestamp"`
	CreatedAt        time.Time `gorm:"type:timestamp;autoCreateTime"`
}

// BeforeSave updates SentAt before saving
func (n *Notification) BeforeSave(tx *gorm.DB) (err error) {
	if n.SentAt.IsZero() {
		n.SentAt = time.Now()
	}
	return nil
}
