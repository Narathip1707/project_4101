"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { isAuthenticated, getUserInfo } from "@/utils/auth";
import { Home as HomeIcon, FileText, Bell, User, LogIn, UserPlus, Star, TrendingUp, Calendar, Eye, Briefcase } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  studentName: string;
  advisorName: string;
  status: string;
  year: string;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ fullName: string } | null>(null);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);

    if (authenticated) {
      // ดึงข้อมูลผู้ใช้จาก API
      try {
        const token = localStorage.getItem("token");
        const baseUrl = process.env.NEXT_PUBLIC_API || "http://localhost:8081";
        
        const response = await fetch(`${baseUrl}/api/profile`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (response.ok) {
          const userData = await response.json();
          const formattedUser = {
            fullName: userData.full_name || userData.fullName || 'ผู้ใช้งาน',
          };
          setUser(formattedUser);
          // อัปเดต localStorage ด้วยข้อมูลล่าสุด
          localStorage.setItem("userInfo", JSON.stringify({ ...userData, fullName: formattedUser.fullName }));
        } else {
          // ถ้า API ไม่ทำงาน ใช้ข้อมูลจาก localStorage
          const userInfo = getUserInfo();
          setUser(userInfo || { fullName: "ผู้ใช้งาน" });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // ถ้าเกิด error ใช้ข้อมูลจาก localStorage
        const userInfo = getUserInfo();
        setUser(userInfo || { fullName: "ผู้ใช้งาน" });
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // ตรวจสอบสถานะ authentication เริ่มต้น
    checkAuthStatus();
    loadFeaturedProjects();
  }, []);

  const loadFeaturedProjects = async () => {
    try {
      // Mock data - ในอนาคตจะดึงจาก API จริง
      const mockProjects: Project[] = [
        {
          id: 1,
          title: "ระบบจัดการโครงงานพิเศษออนไลน์",
          description: "พัฒนาระบบจัดการโครงงานพิเศษแบบออนไลน์ เพื่ออำนวยความสะดวกในการติดตามและประเมินผล",
          studentName: "นายสมชาย ใจดี",
          advisorName: "ผศ.ดร.สมหญิง รักการศึกษา",
          status: "completed",
          year: "2024"
        },
        {
          id: 2,
          title: "แอปพลิเคชันเรียนรู้ภาษาอังกฤษด้วย AI",
          description: "สร้างแอปพลิเคชันสำหรับฝึกฝนภาษาอังกฤษโดยใช้เทคโนโลยี AI และ Natural Language Processing",
          studentName: "นางสาวสมศรี เก่งเรียน",
          advisorName: "อ.ดร.สมพงษ์ ชำนาญการ",
          status: "completed",
          year: "2024"
        },
        {
          id: 3,
          title: "ระบบแนะนำหนังสือด้วย Machine Learning",
          description: "พัฒนาระบบแนะนำหนังสือที่เหมาะสมตามความสนใจของผู้ใช้โดยใช้เทคนิค Machine Learning",
          studentName: "นายธนากร วิทยาศาสตร์",
          advisorName: "ผศ.ดร.วิไล คอมพิวเตอร์",
          status: "completed",
          year: "2023"
        }
      ];
      
      setFeaturedProjects(mockProjects);
      setLoading(false);
    } catch (error) {
      console.error('Error loading featured projects:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">เสร็จสมบูรณ์</span>;
      case 'in_progress':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">กำลังดำเนินการ</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">ไม่ทราบสถานะ</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r py-5 from-[#35393C] to-[#2F3234] mb-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            ระบบจัดการโครงงานพิเศษ
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            {isLoggedIn && user ? `ยินดีต้อนรับ, ${user.fullName}` : 'ยินดีต้อนรับสู่ระบบจัดการโครงงานพิเศษ'}
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            ค้นพบโครงงานที่น่าสนใจ เรียนรู้จากผลงานของรุ่นพี่ และสร้างสรรค์โครงงานของคุณเอง
          </p>
          
          {!isLoggedIn && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/login" 
                className="flex items-center justify-center gap-2 bg-white text-[#0000FF] px-8 py-3 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              >
                <LogIn className="w-5 h-5" />
                เข้าสู่ระบบ
              </Link>
              <Link 
                href="/signup" 
                className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border-2 border-white px-8 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              >
                <UserPlus className="w-5 h-5" />
                ลงทะเบียน
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Featured Projects Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-[#0000FF]" />
              <h2 className="text-3xl font-bold text-gray-900">โครงงานแนะนำ</h2>
            </div>
            <p className="text-gray-600">โครงงานที่โดดเด่นและน่าสนใจ</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0000FF] mx-auto"></div>
            <p className="text-gray-600 mt-4">กำลังโหลดโครงงาน...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    {getStatusBadge(project.status)}
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Calendar className="w-4 h-4" />
                      {project.year}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#0000FF] transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        <span className="font-medium">นักศึกษา:</span> {project.studentName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        <span className="font-medium">อาจารย์:</span> {project.advisorName}
                      </span>
                    </div>
                  </div>
                  
                  {isLoggedIn ? (
                    <Link
                      href={`/projects/${project.id}`}
                      className="flex items-center justify-center gap-2 w-full bg-[#0000FF] text-white px-4 py-2.5 rounded-xl hover:bg-[#0000CC] transition-all duration-300 shadow-md hover:shadow-lg font-medium group"
                    >
                      <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      ดูรายละเอียด
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 w-full bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-300 transition-all duration-300 shadow-md hover:shadow-lg font-medium group"
                    >
                      <LogIn className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      เข้าสู่ระบบเพื่อดูเพิ่มเติม
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      {!isLoggedIn && (
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="bg-gradient-to-r from-[#0000FF] to-[#0000CC] rounded-3xl p-12 text-center shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              พร้อมที่จะเริ่มต้นแล้วหรือยัง?
            </h2>
            <p className="text-white/90 text-lg mb-8">
              เข้าสู่ระบบเพื่อสร้างและจัดการโครงงานของคุณ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/login" 
                className="flex items-center justify-center gap-2 bg-white text-[#0000FF] px-8 py-3 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              >
                <LogIn className="w-5 h-5" />
                เข้าสู่ระบบ
              </Link>
              <Link 
                href="/signup" 
                className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border-2 border-white px-8 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              >
                <UserPlus className="w-5 h-5" />
                ลงทะเบียนใหม่
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
