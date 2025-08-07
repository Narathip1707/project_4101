package models

import "time"

type Log struct {
	ID          string    `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	UserID      string    `gorm:"type:uuid"`
	Action      string    `gorm:"type:varchar(255);not null"`
	Description string    `gorm:"type:text"`
	CreatedAt   time.Time `gorm:"type:timestamp;autoCreateTime"`
}
