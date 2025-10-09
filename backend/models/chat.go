package models

import (
	"time"

	"github.com/google/uuid"
)

// ChatMessage represents a chat message in a project
type ChatMessage struct {
	ID         uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	ProjectID  uuid.UUID `json:"project_id" gorm:"type:uuid;not null"`
	SenderID   uuid.UUID `json:"sender_id" gorm:"type:uuid;not null"`
	SenderRole string    `json:"sender_role" gorm:"type:varchar(20);not null;check:sender_role IN ('student', 'advisor')"`
	Message    string    `json:"message" gorm:"type:text;not null"`
	IsRead     bool      `json:"is_read" gorm:"default:false"`
	CreatedAt  time.Time `json:"created_at" gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt  time.Time `json:"updated_at" gorm:"default:CURRENT_TIMESTAMP"`

	// Relations
	Project *Project `json:"project,omitempty" gorm:"foreignKey:ProjectID"`
	Sender  *User    `json:"sender,omitempty" gorm:"foreignKey:SenderID"`
}

// ChatMessageInput represents the input structure for WebSocket messages (allows empty ID)
type ChatMessageInput struct {
	ID         string `json:"id,omitempty"`
	ProjectID  string `json:"project_id"`
	SenderID   string `json:"sender_id"`
	SenderRole string `json:"sender_role"`
	Message    string `json:"message"`
	IsRead     bool   `json:"is_read"`
	CreatedAt  string `json:"created_at"`
}

// TableName specifies the table name for ChatMessage
func (ChatMessage) TableName() string {
	return "chat_messages"
}

// WebSocketMessage represents the real-time message structure
type WebSocketMessage struct {
	Type      string           `json:"type"` // "message", "typing", "read", "connected"
	ProjectID string           `json:"project_id,omitempty"`
	Message   ChatMessageInput `json:"message,omitempty"` // For incoming messages
	UserID    string           `json:"user_id,omitempty"`
	UserName  string           `json:"user_name,omitempty"`
	Timestamp time.Time        `json:"timestamp"`
}

// WebSocketBroadcast represents the broadcast message structure (with full ChatMessage)
type WebSocketBroadcast struct {
	Type      string       `json:"type"`
	ProjectID string       `json:"project_id,omitempty"`
	Message   *ChatMessage `json:"message,omitempty"` // For outgoing messages (full object)
	UserID    string       `json:"user_id,omitempty"`
	UserName  string       `json:"user_name,omitempty"`
	Timestamp time.Time    `json:"timestamp"`
}
