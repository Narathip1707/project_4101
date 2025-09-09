"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdDate: string;
  relatedTo?: {
    type: "project" | "system" | "advisor";
    id?: string;
    name: string;
  };
}

export default function Notifications() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      // Mock data - ในอนาคตจะเป็น API Call จริง
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "โครงงานได้รับการอนุมัติ",
          message: "โครงงาน 'ระบบแนะนำหนังสือด้วย AI' ของคุณได้รับการอนุมัติจากอาจารย์ที่ปรึกษาแล้ว สามารถเริ่มดำเนินการได้",
          type: "success",
          isRead: false,
          createdDate: "2024-02-20T10:30:00Z",
          relatedTo: {
            type: "project",
            id: "3",
            name: "ระบบแนะนำหนังสือด้วย AI"
          }
        },
        {
          id: "2",
          title: "การประชุมกับอาจารย์ที่ปรึกษา",
          message: "อ.ดร.สมชาย ใจดี ได้นัดหมายการประชุมในวันที่ 25 กุมภาพันธ์ 2567 เวลา 14:00 น. ห้อง CS-201",
          type: "info",
          isRead: true,
          createdDate: "2024-02-18T14:15:00Z",
          relatedTo: {
            type: "advisor",
            name: "อ.ดร.สมชาย ใจดี"
          }
        },
        {
          id: "3",
          title: "กำหนดส่งรายงานความก้าวหน้า",
          message: "กำหนดส่งรายงานความก้าวหน้าโครงงานครั้งที่ 1 ภายในวันที่ 28 กุมภาพันธ์ 2567",
          type: "warning",
          isRead: false,
          createdDate: "2024-02-15T09:00:00Z",
          relatedTo: {
            type: "system",
            name: "ระบบจัดการโครงงาน"
          }
        },
        {
          id: "4",
          title: "อัพเดทระบบ",
          message: "ระบบจะมีการปรับปรุงในวันที่ 22 กุมภาพันธ์ 2567 เวลา 02:00-04:00 น. อาจมีการหยุดให้บริการชั่วคราว",
          type: "info",
          isRead: true,
          createdDate: "2024-02-14T16:45:00Z",
          relatedTo: {
            type: "system",
            name: "ระบบจัดการโครงงาน"
          }
        },
        {
          id: "5",
          title: "โครงงานต้องการการแก้ไข",
          message: "โครงงาน 'ระบบจัดการข้อมูลนักศึกษาออนไลน์' ต้องการการแก้ไขตามข้อเสนอแนะของอาจารย์ที่ปรึกษา",
          type: "error",
          isRead: false,
          createdDate: "2024-02-12T11:20:00Z",
          relatedTo: {
            type: "project",
            id: "1",
            name: "ระบบจัดการข้อมูลนักศึกษาออนไลน์"
          }
        },
        {
          id: "6",
          title: "ยินดีต้อนรับสู่ระบบ",
          message: "ยินดีต้อนรับเข้าสู่ระบบจัดการโครงงานพิเศษ หากมีข้อสงสัยสามารถติดต่อได้ที่ admin@university.ac.th",
          type: "info",
          isRead: true,
          createdDate: "2024-01-15T08:00:00Z",
          relatedTo: {
            type: "system",
            name: "ระบบจัดการโครงงาน"
          }
        }
      ];
      setNotifications(mockNotifications);
    }
  }, []);

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "info": return "border-blue-500 bg-blue-50";
      case "success": return "border-green-500 bg-green-50";
      case "warning": return "border-yellow-500 bg-yellow-50";
      case "error": return "border-red-500 bg-red-50";
      default: return "border-gray-500 bg-gray-50";
    }
  };

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info": return "ℹ️";
      case "success": return "✅";
      case "warning": return "⚠️";
      case "error": return "❌";
      default: return "📢";
    }
  };

  const getTypeText = (type: Notification["type"]) => {
    switch (type) {
      case "info": return "ข้อมูล";
      case "success": return "สำเร็จ";
      case "warning": return "คำเตือน";
      case "error": return "ข้อผิดพลาด";
      default: return "ทั่วไป";
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const filteredNotifications = filter === "all" 
    ? notifications 
    : filter === "unread"
    ? notifications.filter(notif => !notif.isRead)
    : notifications.filter(notif => notif.type === filter);

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-black">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-gray-600 mb-6">คุณต้องเข้าสู่ระบบเพื่อดูการแจ้งเตือน</p>
          <Link href="/login">
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
              เข้าสู่ระบบ
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[rgba(13,33,57,255)] p-10">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">การแจ้งเตือน</h1>
        <p className="text-center text-white">ติดตามข่าวสารและการแจ้งเตือนสำคัญ</p>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Action Bar */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-black">รายการแจ้งเตือน</h2>
              <div className="flex items-center gap-2">
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                  ทั้งหมด {notifications.length}
                </span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                    ยังไม่อ่าน {unreadCount}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">ทั้งหมด</option>
                <option value="unread">ยังไม่อ่าน</option>
                <option value="info">ข้อมูล</option>
                <option value="success">สำเร็จ</option>
                <option value="warning">คำเตือน</option>
                <option value="error">ข้อผิดพลาด</option>
              </select>
              
              {/* Mark All Read Button */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  อ่านทั้งหมด
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white shadow-lg rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-black mb-2">ไม่มีการแจ้งเตือน</h3>
            <p className="text-gray-600">
              {filter === "all" 
                ? "คุณไม่มีการแจ้งเตือนในขณะนี้" 
                : `ไม่มีการแจ้งเตือนประเภท "${filter === "unread" ? "ยังไม่อ่าน" : getTypeText(filter as Notification["type"])}"`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white shadow-lg rounded-lg p-6 border-l-4 ${getTypeColor(notification.type)} ${
                  !notification.isRead ? "border-l-8" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                      <h3 className={`text-lg font-semibold ${!notification.isRead ? "text-black" : "text-gray-700"}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                          ใหม่
                        </span>
                      )}
                    </div>
                    
                    <p className={`mb-3 ${!notification.isRead ? "text-gray-800" : "text-gray-600"}`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          {new Date(notification.createdDate).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                        {notification.relatedTo && (
                          <span className="text-blue-600">
                            {notification.relatedTo.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {notification.relatedTo?.type === "project" && notification.relatedTo.id && (
                          <Link href={`/projects/${notification.relatedTo.id}`}>
                            <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                              ดูโครงงาน
                            </button>
                          </Link>
                        )}
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                          >
                            ทำเครื่องหมายว่าอ่านแล้ว
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/">
            <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
              กลับสู่หน้าหลัก
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
