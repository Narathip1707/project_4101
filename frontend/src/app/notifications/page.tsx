"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      loadNotifications();
    }
  }, []);

  const loadNotifications = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API || "http://localhost:8081";
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${baseUrl}/api/notifications`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        const formattedNotifications: Notification[] = data.map((notification: any) => ({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type || 'info',
          isRead: notification.is_read || false,
          createdDate: notification.sent_at || notification.created_at,
          relatedTo: {
            type: "system",
            name: "ระบบจัดการโครงงาน"
          }
        }));
        setNotifications(formattedNotifications);
      } else {
        console.error('Failed to load notifications');
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  };

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
        <div className="text-center animate-scaleIn">
          <h1 className="text-3xl font-bold mb-4 text-black animate-fadeInUp animate-delay-200">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-gray-600 mb-6 animate-fadeInUp animate-delay-400">คุณต้องเข้าสู่ระบบเพื่อดูการแจ้งเตือน</p>
          <Link href="/login">
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 hover:scale-105 transition-all duration-200 animate-fadeInUp animate-delay-600 hover:shadow-lg">
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
      <div className="bg-[rgba(13,33,57,255)] p-10 animate-slideInFromTop">
        <h1 className="text-3xl font-bold text-center mb-2 text-white animate-fadeInUp animate-delay-200">การแจ้งเตือน</h1>
        <p className="text-center text-white animate-fadeInUp animate-delay-400">ติดตามข่าวสารและการแจ้งเตือนสำคัญ</p>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Action Bar */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6 animate-fadeInUp animate-delay-600 hover:shadow-xl transition-shadow">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 animate-fadeInLeft animate-delay-700">
              <h2 className="text-xl font-bold text-black">รายการแจ้งเตือน</h2>
              <div className="flex items-center gap-2">
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300 transition-colors">
                  ทั้งหมด {notifications.length}
                </span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm animate-pulse">
                    ยังไม่อ่าน {unreadCount}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 animate-fadeInRight animate-delay-800">
              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:shadow-md transition-shadow"
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
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 hover:scale-105 transition-all duration-200 hover:shadow-lg"
                >
                  อ่านทั้งหมด
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white shadow-lg rounded-lg p-12 text-center animate-scaleIn animate-delay-900 hover:shadow-xl transition-shadow">
            <div className="text-6xl mb-4 animate-bounce animate-delay-1000">🔔</div>
            <h3 className="text-xl font-semibold text-black mb-2 animate-fadeInUp animate-delay-1100">ไม่มีการแจ้งเตือน</h3>
            <p className="text-gray-600 animate-fadeInUp animate-delay-1200">
              {filter === "all" 
                ? "คุณไม่มีการแจ้งเตือนในขณะนี้" 
                : `ไม่มีการแจ้งเตือนประเภท "${filter === "unread" ? "ยังไม่อ่าน" : getTypeText(filter as Notification["type"])}"`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`bg-white shadow-lg rounded-lg p-6 border-l-4 ${getTypeColor(notification.type)} ${
                  !notification.isRead ? "border-l-8" : ""
                } hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fadeInUp animate-delay-${900 + index * 100}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl hover:scale-110 transition-transform animate-pulse animate-delay-${1000 + index * 100}">{getTypeIcon(notification.type)}</span>
                      <h3 className={`text-lg font-semibold ${!notification.isRead ? "text-black" : "text-gray-700"} hover:text-blue-600 transition-colors`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs animate-pulse">
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
                          <span className="text-blue-600 hover:text-blue-800 transition-colors">
                            {notification.relatedTo.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {notification.relatedTo?.type === "project" && notification.relatedTo.id && (
                          <Link href={`/projects/${notification.relatedTo.id}`}>
                            <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 hover:scale-105 transition-all duration-200">
                              ดูโครงงาน
                            </button>
                          </Link>
                        )}
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 hover:scale-105 transition-all duration-200"
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
        <div className="text-center mt-8 animate-fadeInUp animate-delay-1400">
          <Link href="/">
            <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 hover:scale-105 transition-all duration-200 hover:shadow-lg">
              กลับสู่หน้าหลัก
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
