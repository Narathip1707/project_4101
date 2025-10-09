"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUserInfo } from "@/utils/auth";

type Message = {
  id: string;
  project_id?: string;
  sender_id: string;
  sender_name: string;
  sender_role: "student" | "advisor";
  message: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    id: string;
    full_name: string;
  };
};

type ProjectInfo = {
  id: string;
  title: string;
  student_name: string;
  student_id: string;
};

type WebSocketMessage = {
  type: 'connected' | 'message' | 'typing' | 'read';
  project_id?: string;
  message?: Message;
  user_id?: string;
  user_name?: string;
  timestamp?: string;
};

export default function ProjectChat({ params }: { params: Promise<{ 'project-id': string }> }) {
  const { 'project-id': id } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [user, setUser] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const sendingMessageRef = useRef(false); // Flag to prevent cleanup during send
  const cleanupBlockedRef = useRef(false); // Block cleanup during message send

  const baseUrl = process.env.NEXT_PUBLIC_API || "http://localhost:8081";

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    console.log('Messages updated:', messages.length, messages);
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const userInfo = getUserInfo();
    setUser(userInfo);
    console.log('User info:', userInfo);
    loadProjectInfo();
    loadMessages();
  }, [id]);

  const loadProjectInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${baseUrl}/api/projects/${id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const projectData = await response.json();
        setProject({
          id: projectData.id,
          title: projectData.title || 'ไม่มีชื่อโปรเจค',
          student_name: projectData.student?.user?.full_name || 'ไม่ระบุนักศึกษา',
          student_id: projectData.student?.id || '',
        });
      }
    } catch (error) {
      console.error("Error loading project info:", error);
    }
  };

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      
      console.log('Loading messages from API...');
      const response = await fetch(`${baseUrl}/api/chats/${id}/messages`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      console.log('API Response status:', response.status);
      
      if (response.ok) {
        const messagesData = await response.json();
        console.log('Messages loaded:', messagesData);
        setMessages(messagesData || []);
      } else {
        console.error('Failed to load messages:', response.statusText);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    }
  };

  // WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    let isUnmounted = false;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;

    const connectWebSocket = () => {
      // Clean up existing connection
      if (wsRef.current) {
        try {
          wsRef.current.close(1000, 'Component cleanup');
        } catch (e) {
          // Ignore close errors
        }
        wsRef.current = null;
      }

      // Don't reconnect if unmounted or exceeded max attempts
      if (isUnmounted || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.log('Max reconnection attempts reached');
        }
        return;
      }

      // Connect to WebSocket
      const wsUrl = `ws://localhost:8081/ws/chat/${id}?token=${token}`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      try {
        const ws = new WebSocket(wsUrl);
        let pingInterval: NodeJS.Timeout | null = null;

        ws.onopen = () => {
          console.log('✅ WebSocket connected');
          setIsConnected(true);
          reconnectAttempts = 0; // Reset counter on successful connection

          // Send ping every 30 seconds to keep connection alive
          pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              try {
                ws.send(JSON.stringify({ type: 'ping' }));
              } catch (e) {
                console.error('Error sending ping:', e);
              }
            } else {
              if (pingInterval) clearInterval(pingInterval);
            }
          }, 30000);
        };

        ws.onmessage = (event) => {
          try {
            const wsMessage: WebSocketMessage = JSON.parse(event.data);
            console.log('WebSocket message received:', wsMessage);

            switch (wsMessage.type) {
              case 'connected':
                console.log('Connected to chat');
                break;

              case 'message':
                console.log('Message data:', wsMessage.message);
                if (wsMessage.message) {
                  console.log('Adding message to state:', wsMessage.message);
                  setMessages((prev) => {
                    const newMessages = [...prev, wsMessage.message!];
                    console.log('Updated messages:', newMessages);
                    return newMessages;
                  });
                  setSending(false);
                  sendingMessageRef.current = false; // Clear sending flag
                  cleanupBlockedRef.current = false; // Unblock cleanup
                } else {
                  console.warn('Message received but wsMessage.message is null/undefined');
                }
                break;

              case 'typing':
                if (wsMessage.user_id !== user?.id) {
                  setIsTyping(true);
                  if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                  }
                  typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                  }, 2000);
                }
                break;
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          setIsConnected(false);
          // Don't increment reconnect attempts here, let onclose handle it
        };

        ws.onclose = (event) => {
          console.log(`🔌 WebSocket disconnected - Code: ${event.code}, Reason: ${event.reason || 'No reason'}`);
          setIsConnected(false);
          
          // Clear ping interval
          if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
          }
          
          // Codes to not reconnect:
          // 1000 = Normal closure
          // 1001 = Going away (page navigation)
          const shouldNotReconnect = [1000, 1001].includes(event.code);
          
          // Attempt to reconnect after delay if not unmounted and not a normal closure
          if (!isUnmounted && !shouldNotReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 10000); // Exponential backoff, max 10s
            console.log(`🔄 Will attempt to reconnect in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log(`🔄 Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
              connectWebSocket();
            }, delay);
          } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.log('❌ Max reconnection attempts reached. Please refresh the page.');
          }
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('❌ Error creating WebSocket:', error);
        setIsConnected(false);
        reconnectAttempts++;
        
        // Try to reconnect after error
        if (!isUnmounted && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 5000);
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        }
      }
    };

    // Initial connection
    connectWebSocket();

    return () => {
      console.log('🧹 Cleanup function called');
      isUnmounted = true;
      
      // Check if cleanup is blocked (message being sent)
      if (cleanupBlockedRef.current) {
        console.log('⛔ CLEANUP BLOCKED - Message is being sent, will not close WebSocket');
        return;
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = undefined;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = undefined;
      }
      
      if (wsRef.current) {
        console.log('Closing WebSocket normally');
        try {
          wsRef.current.close(1000, 'Component unmounting');
          wsRef.current = null;
        } catch (e) {
          console.error('Error closing WebSocket:', e);
        }
      }
    };
  }, [id]); // Only re-run when project ID changes

  const handleSendMessage = () => {
    if (!newMessage.trim() || sending) return;

    // Check WebSocket state
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected. State:', wsRef.current?.readyState);
      alert('กรุณารอสักครู่ WebSocket กำลังเชื่อมต่อ...');
      return;
    }

    // Block cleanup during send
    cleanupBlockedRef.current = true;
    setSending(true);
    sendingMessageRef.current = true; // Mark that we're sending
    
    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately

    try {
      const wsMessage: WebSocketMessage = {
        type: 'message',
        message: {
          id: '',
          project_id: id,
          sender_id: user?.id || '',
          sender_name: user?.fullName || user?.full_name || 'อาจารย์',
          sender_role: 'advisor',
          message: messageText,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      };

      const messageJson = JSON.stringify(wsMessage);
      console.log('🚀 Sending message:', wsMessage);
      console.log('📦 Message JSON:', messageJson);
      console.log('🔌 WebSocket state:', wsRef.current.readyState, '(1 = OPEN)');
      console.log('📊 Buffer before send:', wsRef.current.bufferedAmount, 'bytes');
      
      // Send the message
      wsRef.current.send(messageJson);
      
      console.log('✅ Message queued to send');
      console.log('📊 Buffer after send:', wsRef.current.bufferedAmount, 'bytes');
      
      // Fallback: Unblock cleanup and reset sending state after 5 seconds if no response
      setTimeout(() => {
        if (sendingMessageRef.current) {
          console.log('⚠️ Message send timeout - unblocking cleanup');
          sendingMessageRef.current = false;
          cleanupBlockedRef.current = false;
          setSending(false);
        }
      }, 5000);
      
      // Note: setSending(false) will be called when we receive the message back from server
      // through WebSocket onmessage handler (case 'message')
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setNewMessage(messageText); // Restore message on error
      setSending(false);
      sendingMessageRef.current = false;
      cleanupBlockedRef.current = false;
    }
  };  const handleTyping = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const wsMessage: WebSocketMessage = {
        type: 'typing',
        user_id: user?.id,
        user_name: user?.fullName || user?.full_name,
      };
      wsRef.current.send(JSON.stringify(wsMessage));
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("th-TH", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">แชทกับนักศึกษา</h1>
              <p className="mt-1 text-gray-600">{project.title}</p>
              <p className="text-sm text-gray-500">นักศึกษา: {project.student_name}</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
                </span>
              </div>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                ← กลับ
              </button>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
          {/* Chat Messages */}
          <div
            id="chat-container"
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">💬</div>
                <p className="text-gray-500 text-lg">ยังไม่มีข้อความ</p>
                <p className="text-gray-400 text-sm mt-2">เริ่มการสนทนากับนักศึกษา</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_role === "student" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.sender_role === "student"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium opacity-75">
                        {message.sender_name}
                      </span>
                      <span className="text-xs opacity-50">
                        {formatMessageTime(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{message.message}</p>
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex justify-end">
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-blue-600 text-white opacity-70">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-sm">กำลังส่งข้อความ...</span>
                  </div>
                </div>
              </div>
            )}
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="พิมพ์ข้อความของคุณ..."
                  rows={3}
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                  disabled={sending || !isConnected}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {isConnected ? 'กด Enter เพื่อส่งข้อความ หรือ Shift+Enter เพื่อขึ้นบรรทัดใหม่' : 'กำลังเชื่อมต่อ...'}
                </p>
              </div>
              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending || !isConnected}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ส่ง
                    </>
                  ) : (
                    "ส่งข้อความ"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="text-blue-400 text-xl">💡</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">เทคนิคการให้คำปรึกษา</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>ตอบกลับข้อสงสัยของนักศึกษาอย่างทันท่วงที</li>
                  <li>ให้คำแนะนำที่ชัดเจนและเป็นรูปธรรม</li>
                  <li>ติดตามความคืบหน้าและให้กำลังใจนักศึกษา</li>
                  <li>แจ้งข้อควรปรับปรุงพร้อมแนวทางแก้ไข</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}