"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isAuthenticated, getUserInfo } from "@/utils/auth";

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
    
    // Redirect logged-in users to their dashboard
    const authenticated = isAuthenticated();
    if (authenticated) {
      const userInfo = getUserInfo();
      if (userInfo?.role === "student") {
        window.location.href = "/student/dashboard";
      } else if (userInfo?.role === "advisor") {
        window.location.href = "/advisor/dashboard";
      } else if (userInfo?.role === "admin") {
        window.location.href = "/admin/dashboard";
      }
    }
  }, []);

  if (isLoggedIn && user) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header with animation */}
        <div className="bg-[rgba(13,33,57,255)] p-10 animate-fadeInDown">
          <h1 className="text-3xl font-bold text-center mb-4 text-white animate-fadeInUp animate-delay-200">
            ยินดีต้อนรับ, {user.fullName}!
          </h1>
          <p className="text-center mb-4 text-white animate-fadeInUp animate-delay-300">
            หน้าโฮมของระบบจัดการโครงงานพิเศษ
          </p>
        </div>
        
        {/* Title section with animation */}
        <div className="mt-10 text-center animate-fadeInUp animate-delay-400">
          <h1 className="text-4xl font-semibold inline-block pb-2 text-black border-b-4 border-blue-500 hover-scale">
            ตัวอย่างโครงงานพิเศษ
          </h1>
        </div>

        {/* Project cards with staggered animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 m-6 text-black">
          {[
            { 
              id: "1",
              title: "ระบบจัดการข้อมูลนักศึกษาออนไลน์", 
              desc: "พัฒนาระบบเว็บแอปพลิเคชันสำหรับจัดการข้อมูลนักศึกษา รวมถึงการลงทะเบียนเรียน การดูผลการเรียน", 
              status: "กำลังดำเนินการ",
              advisor: "อ.ดร.สมชาย ใจดี"
            },
            { 
              id: "2",
              title: "แอปพลิเคชันจัดการคลังสินค้า", 
              desc: "สร้างแอปพลิเคชันมือถือสำหรับจัดการสต็อกสินค้า ติดตามการเข้า-ออกของสินค้า และสร้างรายงานสรุป", 
              status: "ร่าง",
              advisor: "อ.ดร.วิไล เก่งมาก"
            },
            { 
              id: "3",
              title: "ระบบแนะนำหนังสือด้วย AI", 
              desc: "พัฒนาระบบแนะนำหนังสือโดยใช้เทคนิค Machine Learning เพื่อวิเคราะห์ความชอบของผู้ใช้", 
              status: "อนุมัติแล้ว",
              advisor: "อ.ดร.ปัญญา เจ้าปัญญา"
            },
          ].map((project, idx) => (
            <div 
              key={idx} 
              className={`m-2 bg-white shadow-lg p-6 flex flex-col justify-between rounded-lg hover-lift animate-fadeInUp animate-delay-${(idx + 5) * 100} opacity-0`}
            >
              <div>
                <h2 className="text-xl font-bold mb-2 text-blue-800">{project.title}</h2>
                <p className="text-gray-600 mb-3">{project.desc}</p>
                <div className="mb-3">
                  <p className="text-sm text-gray-500 mb-1">
                    <span className="font-medium">อาจารย์ที่ปรึกษา:</span> {project.advisor}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">สถานะ:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs transition-all duration-300 ${
                      project.status === "อนุมัติแล้ว" ? "bg-green-100 text-green-800 animate-pulse-custom" :
                      project.status === "กำลังดำเนินการ" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {project.status}
                    </span>
                  </p>
                </div>
              </div>
              <Link href={`/projects/${project.id}`}>
                <button className="mt-auto bg-blue-500 text-white text-sm px-3 py-2 hover:bg-blue-600 w-full rounded transition-all duration-300 hover:shadow-lg transform hover:scale-105">
                  ดูรายละเอียด
                </button>
              </Link>
            </div>
          ))}
        </div>
        
        {/* Divider with animation */}
        <div className="border-t-2 border-gray-300 m-10 animate-fadeInUp animate-delay-800"></div>
        
        {/* Action buttons with animation */}
        <div className="flex justify-center gap-4 max-w-4xl mx-auto p-6 animate-slideInFromBottom animate-delay-900">
          <Link
            href="/projects"
            className="bg-blue-500 text-white p-4 hover:bg-blue-600 text-center flex-1 rounded-lg transition-all duration-300 hover-lift glow"
          >
            📚 ดูโครงงาน
          </Link>
          <Link
            href="/profile"
            className="bg-green-500 text-white p-4 hover:bg-green-600 text-center flex-1 rounded-lg transition-all duration-300 hover-lift glow"
          >
            👤 จัดการโปรไฟล์
          </Link>
          <Link
            href="/notifications"
            className="bg-yellow-500 text-white p-4 hover:bg-yellow-600 text-center flex-1 rounded-lg transition-all duration-300 hover-lift glow"
          >
            🔔 ดูการแจ้งเตือน
          </Link>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center text-black animate-fadeInUp">
        <h1 className="text-3xl font-bold mb-4 animate-fadeInDown">
          ระบบจัดการโครงงานพิเศษ
        </h1>
        <p className="text-2xl mb-4 animate-fadeInUp animate-delay-200">
          กรุณาเข้าสู่ระบบหรือลงทะเบียนเพื่อเริ่มต้น
        </p>
        <div className="flex justify-center space-x-4 animate-fadeInUp animate-delay-400">
          <Link href="/login" className="text-blue-500 hover:underline">
            <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 hover-lift glow">
              🔐 เข้าสู่ระบบ
            </button>
          </Link>
          <Link href="/signup" className="text-blue-500 hover:underline ml-4">
            <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-300 hover-lift glow">
              📝 ลงทะเบียน
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}