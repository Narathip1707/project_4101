package models

import (
	"time"

	"gorm.io/gorm"
)

type SystemSetting struct {
	ID           string    `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	SettingKey   string    `gorm:"type:varchar(100);unique;not null"`
	SettingValue string    `gorm:"type:text"`
	Description  string    `gorm:"type:text"`
	CreatedAt    time.Time `gorm:"type:timestamp;autoCreateTime"`
	UpdatedAt    time.Time `gorm:"type:timestamp;autoUpdateTime"`
}

// BeforeSave updates UpdatedAt before saving
func (ss *SystemSetting) BeforeSave(tx *gorm.DB) (err error) {
	ss.UpdatedAt = time.Now()
	return nil
}
