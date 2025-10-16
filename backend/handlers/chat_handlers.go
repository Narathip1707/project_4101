package handlers

import (
	"backend/models"
	"log"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ChatHandler handles chat-related operations
type ChatHandler struct {
	DB  *gorm.DB
	Hub *ChatHub
}

// NewChatHandler creates a new chat handler
func NewChatHandler(db *gorm.DB) *ChatHandler {
	hub := NewChatHub()
	go hub.Run()
	return &ChatHandler{
		DB:  db,
		Hub: hub,
	}
}

// ChatHub manages WebSocket connections
type ChatHub struct {
	// Registered clients by project ID
	clients map[string]map[*websocket.Conn]bool

	// Broadcast channel
	broadcast chan BroadcastMessage

	// Register channel
	register chan ClientRegistration

	// Unregister channel
	unregister chan ClientRegistration

	// Mutex for thread-safe operations
	mu sync.RWMutex
}

// ClientRegistration represents a client registration
type ClientRegistration struct {
	ProjectID string
	Conn      *websocket.Conn
}

// BroadcastMessage represents a message to broadcast
type BroadcastMessage struct {
	ProjectID string
	Message   interface{} // Can be WebSocketMessage or WebSocketBroadcast
}

// NewChatHub creates a new chat hub
func NewChatHub() *ChatHub {
	return &ChatHub{
		clients:    make(map[string]map[*websocket.Conn]bool),
		broadcast:  make(chan BroadcastMessage),
		register:   make(chan ClientRegistration),
		unregister: make(chan ClientRegistration),
	}
}

// Run starts the hub
func (h *ChatHub) Run() {
	for {
		select {
		case registration := <-h.register:
			h.mu.Lock()
			if _, ok := h.clients[registration.ProjectID]; !ok {
				h.clients[registration.ProjectID] = make(map[*websocket.Conn]bool)
			}
			h.clients[registration.ProjectID][registration.Conn] = true
			h.mu.Unlock()
			log.Printf("Client registered for project %s. Total clients: %d",
				registration.ProjectID, len(h.clients[registration.ProjectID]))

		case registration := <-h.unregister:
			h.mu.Lock()
			if clients, ok := h.clients[registration.ProjectID]; ok {
				if _, ok := clients[registration.Conn]; ok {
					delete(clients, registration.Conn)
					registration.Conn.Close()
					if len(clients) == 0 {
						delete(h.clients, registration.ProjectID)
					}
				}
			}
			h.mu.Unlock()
			log.Printf("Client unregistered from project %s", registration.ProjectID)

		case message := <-h.broadcast:
			h.mu.RLock()
			if clients, ok := h.clients[message.ProjectID]; ok {
				for client := range clients {
					err := client.WriteJSON(message.Message)
					if err != nil {
						log.Printf("Error broadcasting to client: %v", err)
						h.unregister <- ClientRegistration{
							ProjectID: message.ProjectID,
							Conn:      client,
						}
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

// HandleWebSocket handles WebSocket connections
func (h *ChatHandler) HandleWebSocket(c *websocket.Conn) {
	projectID := c.Params("project_id")
	userID := c.Locals("user_id")
	userName := c.Locals("full_name")

	log.Printf("WebSocket connection established for project %s by user %v", projectID, userID)

	// Register client
	h.Hub.register <- ClientRegistration{
		ProjectID: projectID,
		Conn:      c,
	}

	// Send connection confirmation
	connectedMsg := models.WebSocketMessage{
		Type:      "connected",
		ProjectID: projectID,
		UserID:    userID.(string),
		UserName:  userName.(string),
		Timestamp: time.Now(),
	}
	c.WriteJSON(connectedMsg)

	defer func() {
		h.Hub.unregister <- ClientRegistration{
			ProjectID: projectID,
			Conn:      c,
		}
	}()

	// Listen for messages
	for {
		var wsMsg models.WebSocketMessage
		err := c.ReadJSON(&wsMsg)
		if err != nil {
			log.Printf("ReadJSON error: %v (project=%s, user=%s)", err, projectID, userID)
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket unexpected close error: %v", err)
			}
			break
		}

		log.Printf("Received WebSocket message: type=%s, project=%s", wsMsg.Type, projectID)

		// Handle different message types
		switch wsMsg.Type {
		case "message":
			log.Printf("Processing message: %s", wsMsg.Message.Message)

			// Save message to database
			chatMsg := models.ChatMessage{
				ID:         uuid.New(),
				ProjectID:  uuid.MustParse(projectID),
				SenderID:   uuid.MustParse(userID.(string)),
				SenderRole: c.Locals("user_role").(string),
				Message:    wsMsg.Message.Message,
				IsRead:     false,
				CreatedAt:  time.Now(),
			}

			if err := h.DB.Create(&chatMsg).Error; err != nil {
				log.Printf("Error saving message: %v", err)
				continue
			}

			log.Printf("Message saved to database: ID=%s", chatMsg.ID)

			// Preload sender info
			h.DB.Preload("Sender").First(&chatMsg, chatMsg.ID)

			// Broadcast to all clients in this project
			broadcastMsg := models.WebSocketBroadcast{
				Type:      "message",
				ProjectID: projectID,
				Message:   &chatMsg,
				UserID:    userID.(string),
				UserName:  userName.(string),
				Timestamp: time.Now(),
			}

			h.Hub.broadcast <- BroadcastMessage{
				ProjectID: projectID,
				Message:   broadcastMsg,
			}

		case "typing":
			// Broadcast typing indicator
			h.Hub.broadcast <- BroadcastMessage{
				ProjectID: projectID,
				Message:   wsMsg,
			}

		case "ping":
			// Ping message for keepalive - no action needed
			log.Printf("Ping received from project %s", projectID)

		case "read":
			// Mark messages as read
			projectUUID, _ := uuid.Parse(projectID)
			userUUID, _ := uuid.Parse(userID.(string))

			h.DB.Model(&models.ChatMessage{}).
				Where("project_id = ? AND sender_id != ?", projectUUID, userUUID).
				Update("is_read", true)
		default:
			log.Printf("⚠️ Unknown message type received: type=%s, project=%s, user=%s, payload=%+v", wsMsg.Type, projectID, userID.(string), wsMsg)
		}
	}
}

// GetChatHistory - GET /api/chats/:project_id/messages
func (h *ChatHandler) GetChatHistory(c *fiber.Ctx) error {
	projectID := c.Params("project_id")

	// Verify user has access to this project
	userID := c.Locals("user_id")
	userRole := c.Locals("user_role")

	var project models.Project
	query := h.DB.Where("id = ?", projectID)

	// Authorization check
	if userRole == "student" {
		var student models.Student
		if err := h.DB.Where("user_id = ?", userID).First(&student).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Student not found"})
		}
		query = query.Where("student_id = ?", student.ID)
	} else if userRole == "advisor" {
		var advisor models.Advisor
		if err := h.DB.Where("user_id = ?", userID).First(&advisor).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Advisor not found"})
		}
		query = query.Where("advisor_id = ?", advisor.ID)
	}

	if err := query.First(&project).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Project not found or access denied"})
	}

	// Get messages
	var messages []models.ChatMessage
	err := h.DB.Where("project_id = ?", projectID).
		Preload("Sender").
		Order("created_at ASC").
		Find(&messages).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch messages"})
	}

	return c.JSON(messages)
}

// MarkAsRead - PATCH /api/chats/:project_id/read
func (h *ChatHandler) MarkAsRead(c *fiber.Ctx) error {
	projectID := c.Params("project_id")
	userID := c.Locals("user_id")

	// Mark all messages in this project as read (except own messages)
	result := h.DB.Model(&models.ChatMessage{}).
		Where("project_id = ? AND sender_id != ?", projectID, userID).
		Update("is_read", true)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to mark messages as read"})
	}

	return c.JSON(fiber.Map{
		"message": "Messages marked as read",
		"count":   result.RowsAffected,
	})
}

// GetUnreadCount - GET /api/chats/unread
func (h *ChatHandler) GetUnreadCount(c *fiber.Ctx) error {
	userID := c.Locals("user_id")
	userRole := c.Locals("user_role")

	var count int64

	// Get projects for this user
	var projectIDs []uuid.UUID

	if userRole == "student" {
		var student models.Student
		if err := h.DB.Where("user_id = ?", userID).First(&student).Error; err != nil {
			return c.JSON(fiber.Map{"count": 0})
		}

		h.DB.Model(&models.Project{}).
			Where("student_id = ?", student.ID).
			Pluck("id", &projectIDs)

	} else if userRole == "advisor" {
		var advisor models.Advisor
		if err := h.DB.Where("user_id = ?", userID).First(&advisor).Error; err != nil {
			return c.JSON(fiber.Map{"count": 0})
		}

		h.DB.Model(&models.Project{}).
			Where("advisor_id = ?", advisor.ID).
			Pluck("id", &projectIDs)
	}

	// Count unread messages
	h.DB.Model(&models.ChatMessage{}).
		Where("project_id IN ? AND sender_id != ? AND is_read = ?", projectIDs, userID, false).
		Count(&count)

	return c.JSON(fiber.Map{"count": count})
}
