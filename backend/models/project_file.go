package models

import (
	"time"

	"gorm.io/gorm"
)

type ProjectFile struct {
	ID           string    `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	ProjectID    string    `gorm:"type:uuid;not null"`
	UploadedBy   string    `gorm:"type:uuid;not null"`
	FileName     string    `gorm:"type:varchar(255);not null"`
	FilePath     string    `gorm:"type:text;not null"`
	FileSize     int64     `gorm:"type:bigint"`
	FileType     string    `gorm:"type:varchar(100)"`
	FileCategory string    `gorm:"type:varchar(50);check:file_category IN ('proposal', 'progress_report', 'final_report', 'presentation', 'source_code', 'other')"`
	FileStatus   string    `gorm:"type:varchar(20);default:'pending';check:file_status IN ('pending', 'approved', 'rejected')"`
	Version      int       `gorm:"default:1"`
	Description  string    `gorm:"type:text"`
	IsPublic     bool      `gorm:"default:false"`
	CreatedAt    time.Time `gorm:"type:timestamp;autoCreateTime"`
	UpdatedAt    time.Time `gorm:"type:timestamp;autoUpdateTime"`
}

// BeforeSave updates UpdatedAt before saving
func (pf *ProjectFile) BeforeSave(tx *gorm.DB) (err error) {
	pf.UpdatedAt = time.Now()
	return nil
}
