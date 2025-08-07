"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ fullName: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      setUser({ fullName: "Test User" }); // เปลี่ยนเป็น API Call จริง
    }
  }, []);

  if (isLoggedIn && user) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-center mb-6">ยินดีต้อนรับ, {user.fullName}!</h1>
        <p className="text-center mb-4">หน้าโฮมของระบบจัดการโครงงานพิเศษ</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <a
            href="/projects"
            className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 text-center"
          >
            ดูโครงงาน
          </a>
          <a
            href="/profile"
            className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 text-center"
          >
            จัดการโปรไฟล์
          </a>
          <a
            href="/notifications"
            className="bg-yellow-500 text-white p-4 rounded-lg hover:bg-yellow-600 text-center"
          >
            ดูการแจ้งเตือน
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">ระบบจัดการโครงงานพิเศษ</h1>
        <p className="mb-4">กรุณาเข้าสู่ระบบหรือลงทะเบียนเพื่อเริ่มต้น</p>
      </div>
    </div>
  );
}