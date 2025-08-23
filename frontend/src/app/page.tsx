"use client";

import Link from "next/link";
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
        <h1 className="text-3xl font-bold text-center mb-6 text-black placeholder:to-black">ยินดีต้อนรับ, {user.fullName}!</h1>
        <p className="text-center mb-4 text-black placeholder:to-black">หน้าโฮมของระบบจัดการโครงงานพิเศษ</p>
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
      <div className="text-center text-black">
        <h1 className="text-3xl font-bold mb-4">ระบบจัดการโครงงานพิเศษ</h1>
        <p className="text-2xl mb-4">กรุณาเข้าสู่ระบบหรือลงทะเบียนเพื่อเริ่มต้น</p>
        <div className="flex justify-center space-x-4">
          <Link href="/login" className="text-blue-500 hover:underline">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              เข้าสู่ระบบ
            </button>
          </Link>
          <Link href="/signup" className="text-blue-500 hover:underline ml-4">
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
              ลงทะเบียน
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}