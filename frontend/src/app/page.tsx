"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { isAuthenticated, getUserInfo } from "@/utils/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StarfallBackground from "@/components/StarfallBackground";
import { Activity } from "@mynaui/icons-react";
import { AcademicHat } from "@mynaui/icons-react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ fullName: string; role?: "student" | "advisor" | "admin" } | null>(null);

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
    // ตรวจสอบสถานะ authentication เริ่มต้น
    checkAuthStatus();

    // ฟัง custom event สำหรับการ login/logout
    const handleAuthChange = () => {
      checkAuthStatus();
    };
    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  if (isLoggedIn && user) {
    return (
      <div className="relative min-h-screen bg-white animate-fadeInUp">
        {/* content wrapper above stars */}
        <div className="relative z-10">
          {/* Header with animation + university logo */}
          <Card className="m-6 border-0 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white animate-spin animate-delay-100 transform transition-all duration-500 hover:scale-101 hover:shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold animate-scaleIn animate-delay-200">
                ยินดีต้อนรับ, {user.fullName}! 👋
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg animate-fadeInUp animate-delay-300">
                หน้าโฮมของระบบจัดการโครงงานพิเศษ
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Title section */}
          <div className="text-center mb-8 animate-fadeInUp animate-delay-400">
            <h1 className="text-4xl font-semibold text-gray-800 border-b-4 border-blue-500 inline-block pb-2 transform transition-all duration-300 hover:scale-101">
              🎓 ตัวอย่างโครงงานพิเศษ
            </h1>
          </div>

          {/* Project cards with staggered animations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-6 mb-8">
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
              <Card
                key={idx}
                className={`hover:shadow-xl transition-all duration-500 hover:scale-110 transform animate-fadeInUp animate-delay-${(idx + 5) * 100} hover-lift`}
              >
                <CardHeader className="animate-fadeInDown animate-delay-600">
                  <CardTitle className="text-xl text-blue-800 transition-colors duration-300 hover:text-blue-600">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="animate-fadeInUp animate-delay-700">
                    {project.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="animate-fadeInUp animate-delay-800">
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600 transform transition-all duration-300 hover:text-gray-800">
                      <span className="font-medium">อาจารย์ที่ปรึกษา:</span> {project.advisor}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">สถานะ:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs transition-all duration-300 transform hover:scale-110 ${project.status === "อนุมัติแล้ว" ? "bg-green-100 text-green-800 animate-pulse" :
                          project.status === "กำลังดำเนินการ" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                        }`}>
                        {project.status}
                      </span>
                    </p>
                  </div>
                  <Link href={`/projects/${project.id}`}>
                    <Button className="w-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-fadeInUp animate-delay-900">
                      📋 ดูรายละเอียด
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action buttons with enhanced animations */}
          <Card className="mx-6 mb-6 animate-slideInFromBottom animate-delay-1000 transform transition-all duration-500 hover:shadow-xl hover:scale-101">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 place-items-center">
                {/* Dashboard (role-based) */}
                <Link href={(user?.role === "student" && "/student/dashboard") || (user?.role === "advisor" && "/advisor/dashboard") || (user?.role === "admin" && "/admin/dashboard") || "/"}>
                  <Button className="w-64 h-16 text-lg rounded-xl bg-gray-900 hover:bg-gray-800 text-white border border-gray-800/60 animate-fadeInUp animate-delay-1000 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                    <span className="flex items-center justify-center space-x-2">
                      <span className="animate-bounce"><AcademicHat /></span>
                      <span>Dashboard</span>
                    </span>
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button className="w-64 h-16 text-lg rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/60 animate-fadeInLeft animate-delay-1100 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                    <span className="flex items-center justify-center space-x-2">
                      <span className="animate-bounce"><Activity /></span>
                      <span>ดูโครงงาน</span>
                    </span>
                  </Button>
                </Link>

                <Link href="/notifications">
                  <Button className="w-64 h-16 text-lg rounded-xl bg-white-600 hover:bg-fuchsia-500 text-black border border-fuchsia-500/30 animate-fadeInRight animate-delay-1300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                    <span className="flex items-center justify-center space-x-2">
                      <span className="animate-bounce">🔔</span>
                      <span>ดูการแจ้งเตือน</span>
                    </span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center p-4 animate-accordion-down">
      {/* starfall background */}
      <StarfallBackground />
      <Card className="relative z-10 w-full max-w-md animate-scaleIn transform transition-all duration-500 hover:scale-101 hover:shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2 animate-scaleIn animate-delay-100">
            <Image
              src="/ramkhamhaeng-logo.svg"
              alt="Ramkhamhaeng University Logo"
              width={44}
              height={44}
              className="h-50 w-50"
              priority
            />
          </div>
          <CardTitle className="text-3xl font-bold mb-4 animate-fadeInDown animate-delay-200">
            🎓 ระบบจัดการโครงงานพิเศษ
          </CardTitle>
          <CardDescription className="text-lg animate-fadeInUp animate-delay-300">
            กรุณาเข้าสู่ระบบหรือลงทะเบียนเพื่อเริ่มต้น
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 animate-fadeInUp animate-delay-400">
          <Link href="/login">
            <Button className="w-full mb-1 h-12 text-lg bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white animate-fadeInLeft animate-delay-500 transition-all duration-300 transform hover:scale-110 hover:shadow-xl border-0">
              <span className="flex items-center justify-center space-x-2">
                <span className="animate-pulse">🔐</span>
                <span>เข้าสู่ระบบ</span>
              </span>
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="w-full h-12 text-lg bg-gradient-to-r from-yellow-500 to-blue-600 hover:from-yellow-600 hover:to-blue-700 text-white animate-fadeInRight animate-delay-600 transition-all duration-300 transform hover:scale-110 hover:shadow-xl border-0">
              <span className="flex items-center justify-center space-x-2">
                <span className="animate-bounce">📝</span>
                <span>ลงทะเบียน</span>
              </span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
