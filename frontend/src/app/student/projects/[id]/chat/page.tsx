"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserInfo } from "@/utils/auth";

type Message = {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: "student" | "advisor";
  message: string;
  created_at: string;
  is_read: boolean;
};

type ProjectInfo = {
  id: string;
  title: string;
  advisor_name: string;
  advisor_id: string;
};

export default function ProjectChat({ params }: { params: { id: string } }) {
  const { id } = params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [user, setUser] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userInfo = getUserInfo();
    setUser(userInfo);
    loadProjectInfo();
    loadMessages();
  }, [id]);

  const loadProjectInfo = async () => {
    try {
      // Mock data for now
      setProject({
        id: id,
        title: "ระบบจัดการข้อมูลนักศึกษา",
        advisor_name: "อ.ดร.สมชาย ใจดี",
        advisor_id: "advisor1",
      });
    } catch (error) {
      console.error("Error loading project info:", error);
    }
  };

  const loadMessages = async () => {
    try {
      // Mock messages
      setMessages([
        {
          id: "1",
          sender_id: "advisor1",
          sender_name: "อ.ดร.สมชาย ใจดี",
          sender_role: "advisor",
          message: "สวัสดีครับ ผมได้ดูรายงานความก้าวหน้าครั้งที่ 1 แล้ว โดยรวมแล้วดีมากครับ แต่มีข้อเสนอแนะเล็กน้อย",
          created_at: "2024-09-11T10:30:00Z",
          is_read: true,
        },
        {
          id: "2",
          sender_id: "student1",
          sender_name: "นางสาวสมใจ ใจดี",
          sender_role: "student",
          message: "ขอบคุณมากครับอาจารย์ ช่วยแนะนำด้วยครับว่าควรปรับปรุงในส่วนไหน",
          created_at: "2024-09-11T14:15:00Z",
          is_read: true,
        },
        {
          id: "3",
          sender_id: "advisor1",
          sender_name: "อ.ดร.สมชาย ใจดี",
          sender_role: "advisor",
          message: "ในส่วนของ Use Case Diagram ควรเพิ่มรายละเอียดของ Actor และ Relationship ให้ชัดเจนมากขึ้น และในส่วนของ Database Design ควรระบุ Primary Key และ Foreign Key ให้ครบถ้วน",
          created_at: "2024-09-11T15:45:00Z",
          is_read: true,
        },
        {
          id: "4",
          sender_id: "student1",
          sender_name: "นางสาวสมใจ ใจดี",
          sender_role: "student",
          message: "เข้าใจแล้วครับ จะแก้ไขตามที่อาจารย์แนะนำ คาดว่าจะส่งเวอร์ชันใหม่ภายในสัปดาห์หน้าครับ",
          created_at: "2024-09-12T09:20:00Z",
          is_read: false,
        },
      ]);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const messageData = {
        project_id: id,
        message: newMessage.trim(),
        sender_role: "student",
      };

      // Mock send message
      setTimeout(() => {
        const mockMessage: Message = {
          id: Date.now().toString(),
          sender_id: user?.id || "student1",
          sender_name: user?.fullName || "นักศึกษา",
          sender_role: "student",
          message: newMessage.trim(),
          created_at: new Date().toISOString(),
          is_read: false,
        };

        setMessages(prev => [...prev, mockMessage]);
        setNewMessage("");
        setSending(false);
        
        // Scroll to bottom
        setTimeout(() => {
          const chatContainer = document.getElementById("chat-container");
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
      }, 1000);

    } catch (error) {
      console.error("Error sending message:", error);
      setSending(false);
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
              <h1 className="text-2xl font-bold text-gray-900">แชทกับอาจารย์ที่ปรึกษา</h1>
              <p className="mt-1 text-gray-600">{project.title}</p>
              <p className="text-sm text-gray-500">อาจารย์ที่ปรึกษา: {project.advisor_name}</p>
            </div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ← กลับ
            </button>
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
                <p className="text-gray-400 text-sm mt-2">เริ่มการสนทนากับอาจารย์ที่ปรึกษาของคุณ</p>
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
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-6">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="พิมพ์ข้อความของคุณ..."
                  rows={3}
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                  disabled={sending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <p className="mt-1 text-xs text-gray-500">
                  กด Enter เพื่อส่งข้อความ หรือ Shift+Enter เพื่อขึ้นบรรทัดใหม่
                </p>
              </div>
              <div className="flex flex-col justify-end">
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
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
            </form>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="text-blue-400 text-xl">💡</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">เทคนิคการสื่อสาร</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>ระบุข้อมูลที่ชัดเจนเมื่อถามคำถาม</li>
                  <li>แนบไฟล์หรือลิงก์ที่เกี่ยวข้องหากมี</li>
                  <li>ตอบกลับข้อความของอาจารย์ภายใน 24 ชั่วโมง</li>
                  <li>ใช้ภาษาที่สุภาพและเป็นทางการ</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}