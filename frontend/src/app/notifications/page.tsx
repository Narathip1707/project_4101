"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Bell, Info, CheckCircle, AlertTriangle, XCircle, 
  Filter, CheckCheck, Eye, Home, Clock, Loader2
} from 'lucide-react';

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

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info": return <Info className="w-5 h-5 text-[#0000FF]" />;
      case "success": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case "error": return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
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

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "info": return "border-[#0000FF]";
      case "success": return "border-green-500";
      case "warning": return "border-amber-500";
      case "error": return "border-red-500";
      default: return "border-gray-500";
    }
  };

  const getTypeBadgeColor = (type: Notification["type"]) => {
    switch (type) {
      case "info": return "bg-[#0000FF]/10 text-[#0000FF]";
      case "success": return "bg-green-100 text-green-800";
      case "warning": return "bg-amber-100 text-amber-800";
      case "error": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-[#0000FF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell className="w-10 h-10 text-[#0000FF]" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-gray-600 mb-6">คุณต้องเข้าสู่ระบบเพื่อดูการแจ้งเตือน</p>
          <Link href="/login">
            <button className="inline-flex items-center gap-2 bg-[#0000FF] text-white px-6 py-3 rounded-xl hover:bg-[#0000CC] shadow-lg hover:shadow-xl transition-all duration-300">
              <Home className="w-5 h-5" />
              เข้าสู่ระบบ
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0000FF] to-[#0000CC] p-10 shadow-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-white">การแจ้งเตือน</h1>
          </div>
          <p className="text-center text-white/90">ติดตามข่าวสารและการแจ้งเตือนสำคัญ</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Action Bar */}
        <div className="bg-white shadow-xl rounded-2xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">รายการแจ้งเตือน</h2>
              <div className="flex items-center gap-2">
                <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                  ทั้งหมด {notifications.length}
                </span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium animate-pulse">
                    ยังไม่อ่าน {unreadCount}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0000FF] focus:border-transparent text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="unread">ยังไม่อ่าน</option>
                  <option value="info">ข้อมูล</option>
                  <option value="success">สำเร็จ</option>
                  <option value="warning">คำเตือน</option>
                  <option value="error">ข้อผิดพลาด</option>
                </select>
              </div>
              
              {/* Mark All Read Button */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <CheckCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  อ่านทั้งหมด
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white shadow-xl rounded-2xl p-12 text-center border border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">ไม่มีการแจ้งเตือน</h3>
            <p className="text-gray-600">
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
                className={`bg-white shadow-xl rounded-2xl p-6 border-l-4 transition-all hover:shadow-2xl border border-gray-100 ${getTypeColor(notification.type)} ${
                  !notification.isRead ? "border-l-8 bg-gradient-to-r from-[#0000FF]/5 to-white" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="transform hover:scale-110 transition-transform">
                        {getTypeIcon(notification.type)}
                      </span>
                      <h3 className={`text-lg font-bold ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-medium animate-pulse">
                          ใหม่
                        </span>
                      )}
                    </div>
                    
                    <p className={`mb-4 leading-relaxed ${!notification.isRead ? "text-gray-800" : "text-gray-600"}`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(notification.createdDate).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                        {notification.relatedTo && (
                          <span className="text-[#0000FF] font-medium">
                            {notification.relatedTo.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {notification.relatedTo?.type === "project" && notification.relatedTo.id && (
                          <Link href={`/projects/${notification.relatedTo.id}`}>
                            <button className="inline-flex items-center gap-2 bg-[#0000FF] text-white px-4 py-2 rounded-xl hover:bg-[#0000CC] text-sm shadow-lg hover:shadow-xl transition-all duration-300 group">
                              <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              ดูโครงงาน
                            </button>
                          </Link>
                        )}
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-300 text-sm shadow-md hover:shadow-lg transition-all duration-300 group"
                          >
                            <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            อ่านแล้ว
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
            <button className="inline-flex items-center gap-2 bg-white text-gray-900 shadow-xl rounded-xl px-8 py-3 hover:shadow-2xl transition-all duration-300 border border-gray-200 group">
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              กลับสู่หน้าหลัก
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
