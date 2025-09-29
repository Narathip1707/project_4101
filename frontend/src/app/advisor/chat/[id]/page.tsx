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

type StudentInfo = {
  id: string;
  name: string;
  student_id: string;
  project_title: string;
  project_id: string;
};

export default function AdvisorChat({ params }: { params: { id: string } }) {
  const { id } = params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [user, setUser] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userInfo = getUserInfo();
    setUser(userInfo);
    loadStudentInfo();
    loadMessages();
  }, [id]);

  const loadStudentInfo = async () => {
    try {
      // Mock data for now
      setStudent({
        id: id,
        name: "นางสาวสมใจ ใจดี",
        student_id: "6401234567",
        project_title: "ระบบจัดการข้อมูลนักศึกษา",
        project_id: "proj1",
      });
    } catch (error) {
      console.error("Error loading student info:", error);
    }
  };

  const loadMessages = async () => {
    try {
      // Mock messages
      setMessages([
        {
          id: "1",
          sender_id: "student1",
          sender_name: "นางสาวสมใจ ใจดี",
          sender_role: "student",
          message: "สวัสดีครับอาจารย์ ผมได้ส่งรายงานความก้าวหน้าครั้งที่ 2 แล้ว กรุณาตรวจสอบด้วยครับ",
          created_at: "2024-09-12T09:30:00Z",
          is_read: true,
        },
        {
          id: "2",
          sender_id: "advisor1",
          sender_name: "อ.ดร.สมชาย ใจดี",
          sender_role: "advisor",
          message: "สวัสดีครับ ผมได้รับรายงานแล้ว จะตรวจสอบและให้ข้อเสนอแนะภายใน 2-3 วัน",
          created_at: "2024-09-12T10:15:00Z",
          is_read: true,
        },
        {
          id: "3",
          sender_id: "student1",
          sender_name: "นางสาวสมใจ ใจดี",
          sender_role: "student",
          message: "ขอบคุณมากครับอาจารย์ ช่วยแนะนำเรื่องการออกแบบฐานข้อมูลด้วยครับ ผมยังไม่แน่ใจในส่วนของ Relationship",
          created_at: "2024-09-12T11:20:00Z",
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
        student_id: id,
        message: newMessage.trim(),
        sender_role: "advisor",
      };

      // Mock send message
      setTimeout(() => {
        const mockMessage: Message = {
          id: Date.now().toString(),
          sender_id: user?.id || "advisor1",
          sender_name: user?.fullName || "อาจารย์",
          sender_role: "advisor",
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

  if (!student) {
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
              <p className="mt-1 text-gray-600">{student.name} ({student.student_id})</p>
              <p className="text-sm text-gray-500">โครงงาน: {student.project_title}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/advisor/projects/${student.project_id}`)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                📋 ดูโครงงาน
              </button>
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
                <p className="text-gray-400 text-sm mt-2">เริ่มการสนทนากับนักศึกษาของคุณ</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_role === "advisor" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.sender_role === "advisor"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium opacity-75">
                        {message.sender_role === "advisor" ? "อาจารย์" : "นักศึกษา"}
                      </span>
                      <span className="text-xs opacity-50">
                        {formatMessageTime(message.created_at)}
                      </span>
                      {!message.is_read && message.sender_role === "student" && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
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

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">การดำเนินการด่วน</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <div className="text-2xl mb-2">📄</div>
              <h4 className="font-medium text-gray-900">ดูไฟล์ที่ส่ง</h4>
              <p className="text-sm text-gray-500">ตรวจสอบไฟล์ที่นักศึกษาส่งมา</p>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <div className="text-2xl mb-2">📋</div>
              <h4 className="font-medium text-gray-900">ดูความก้าวหน้า</h4>
              <p className="text-sm text-gray-500">ติดตามความก้าวหน้าโครงงาน</p>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <div className="text-2xl mb-2">📅</div>
              <h4 className="font-medium text-gray-900">นัดหมายประชุม</h4>
              <p className="text-sm text-gray-500">นัดหมายพบปะเพื่อให้คำปรึกษา</p>
            </button>
          </div>
        </div>

        {/* Communication Tips */}
        <div className="mt-6 bg-green-50 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="text-green-400 text-xl">💡</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">เทคนิคการให้คำปรึกษา</h3>
              <div className="mt-2 text-sm text-green-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>ตั้งคำถามกระตุ้นให้นักศึกษาคิดวิเคราะห์</li>
                  <li>ให้คำแนะนำที่สร้างสรรค์และเป็นประโยชน์</li>
                  <li>ตอบข้อความภายใน 24 ชั่วโมง</li>
                  <li>สร้างบรรยากาศที่เปิดเผยและเอื้อต่อการเรียนรู้</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}