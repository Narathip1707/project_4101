"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isAuthenticated, getUserInfo } from "@/utils/auth";
import { Home as HomeIcon, FileText, Bell, User, LogIn, UserPlus } from 'lucide-react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ fullName: string } | null>(null);

  const checkAuthStatus = () => {
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);
    
    if (authenticated) {
      const userInfo = getUserInfo();
      setUser(userInfo || { fullName: "Test User" });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  if (isLoggedIn && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              ยินดีต้อนรับ, {user.fullName}
            </h1>
            <p className="text-xl text-gray-600">
              ระบบจัดการโครงงานพิเศษ
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Link
              href="/projects"
              className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">โครงงาน</h3>
                <p className="text-gray-600 text-sm">จัดการและติดตามโครงงานของคุณ</p>
              </div>
            </Link>

            <Link
              href="/profile"
              className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                  <User className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">โปรไฟล์</h3>
                <p className="text-gray-600 text-sm">จัดการข้อมูลส่วนตัวของคุณ</p>
              </div>
            </Link>

            <Link
              href="/notifications"
              className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                  <Bell className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">การแจ้งเตือน</h3>
                <p className="text-gray-600 text-sm">ดูการแจ้งเตือนและอัปเดต</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ระบบจัดการโครงงานพิเศษ
          </h1>
          <p className="text-lg text-gray-600">
            กรุณาเข้าสู่ระบบหรือลงทะเบียนเพื่อเริ่มต้นใช้งาน
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/login" 
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
          >
            <LogIn className="w-5 h-5" />
            เข้าสู่ระบบ
          </Link>
          <Link 
            href="/signup" 
            className="flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl font-medium border border-gray-200"
          >
            <UserPlus className="w-5 h-5" />
            ลงทะเบียน
          </Link>
        </div>
      </div>
    </div>
  );
}
