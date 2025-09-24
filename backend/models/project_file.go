package models

import (
	"time"

	"gorm.io/gorm"
)

type ProjectFile struct {
	ID           string    `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	ProjectID    string    `gorm:"type:uuid;column:project_id" json:"project_id"`
	UploadedBy   string    `gorm:"type:uuid;column:uploaded_by" json:"uploaded_by"`
	FileName     string    `gorm:"type:varchar(255);not null;column:file_name" json:"file_name"`
	FilePath     string    `gorm:"type:text;not null;column:file_path" json:"file_path"`
	FileSize     *int64    `gorm:"type:bigint;column:file_size" json:"file_size,omitempty"`
	FileType     string    `gorm:"type:varchar(100);column:file_type" json:"file_type,omitempty"`
	FileCategory string    `gorm:"type:varchar(50);column:file_category;check:file_category IN ('proposal','progress_report','final_report','presentation','source_code','other')" json:"file_category"`
	FileStatus   string    `gorm:"type:varchar(20);default:'pending';column:file_status;check:file_status IN ('pending','approved','rejected')" json:"file_status"`
	Version      int       `gorm:"default:1" json:"version"`
	Description  string    `gorm:"type:text" json:"description,omitempty"`
	IsPublic     bool      `gorm:"default:false;column:is_public" json:"is_public"`
	CreatedAt    time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;column:created_at" json:"created_at"`
	UpdatedAt    time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;column:updated_at" json:"updated_at"`

	// Relationships
	Project *Project `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
	User    *User    `gorm:"foreignKey:UploadedBy" json:"user,omitempty"`
}

// TableName specifies the table name
func (ProjectFile) TableName() string {
	return "project_files"
}

// BeforeSave updates UpdatedAt before saving
func (pf *ProjectFile) BeforeSave(tx *gorm.DB) (err error) {
	pf.UpdatedAt = time.Now()
	return nil
}
