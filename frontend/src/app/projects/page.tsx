"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string;
  status: "draft" | "submitted" | "approved" | "rejected" | "completed";
  advisor: string;
  createdDate: string;
  lastModified: string;
  members: string[];
}

export default function Projects() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      loadProjects();
    }
  }, []);

  const loadProjects = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API || "http://localhost:8081";
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${baseUrl}/api/projects`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        const formattedProjects: Project[] = data.map((project: any) => ({
          id: project.id,
          title: project.title || 'ไม่มีชื่อโปรเจค',
          description: project.description || 'ไม่มีคำอธิบาย',
          status: project.status || 'proposal',
          advisor: project.advisor?.user?.full_name || 'ยังไม่ได้กำหนดอาจารย์',
          createdDate: project.created_at ? new Date(project.created_at).toLocaleDateString('th-TH') : 'ไม่ระบุ',
          lastModified: project.updated_at ? new Date(project.updated_at).toLocaleDateString('th-TH') : 'ไม่ระบุ',
          members: [project.student?.user?.full_name || 'ไม่ระบุ']
        }));
        setProjects(formattedProjects);
      } else {
        console.error('Failed to load projects');
        setProjects([]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "draft": return "bg-gray-500";
      case "submitted": return "bg-yellow-500";
      case "approved": return "bg-green-500";
      case "rejected": return "bg-red-500";
      case "completed": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: Project["status"]) => {
    switch (status) {
      case "draft": return "ร่าง";
      case "submitted": return "ส่งแล้ว";
      case "approved": return "อนุมัติ";
      case "rejected": return "ไม่อนุมัติ";
      case "completed": return "เสร็จสิ้น";
      default: return "ไม่ทราบสถานะ";
    }
  };

  const filteredProjects = filter === "all" 
    ? projects 
    : projects.filter(project => project.status === filter);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-black">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-gray-600 mb-6">คุณต้องเข้าสู่ระบบเพื่อดูโครงงาน</p>
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
        <h1 className="text-3xl font-bold text-center mb-2 text-white">โครงงานของฉัน</h1>
        <p className="text-center text-white">จัดการและติดตามโครงงานพิเศษของคุณ</p>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Action Bar */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-black">รายการโครงงาน</h2>
              <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                ทั้งหมด {projects.length} โครงงาน
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black shadow-sm"
              >
                <option value="all">ทั้งหมด</option>
                <option value="draft">ร่าง</option>
                <option value="submitted">ส่งแล้ว</option>
                <option value="approved">อนุมัติ</option>
                <option value="rejected">ไม่อนุมัติ</option>
                <option value="completed">เสร็จสิ้น</option>
              </select>
              
              {/* New Project Button */}
              <Link href="/projects/new">
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                  + สร้างโครงงานใหม่
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white shadow-lg rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-black mb-2">ไม่มีโครงงาน</h3>
            <p className="text-gray-600 mb-6">
              {filter === "all" 
                ? "คุณยังไม่มีโครงงานเลย เริ่มสร้างโครงงานแรกของคุณกันเลย!" 
                : `ไม่มีโครงงานที่มีสถานะ "${getStatusText(filter as Project["status"])}"`}
            </p>
            <Link href="/projects/new">
              <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
                สร้างโครงงานใหม่
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-black mb-2 flex-1">{project.title}</h3>
                  <span className={`${getStatusColor(project.status)} text-white px-3 py-1 rounded-full text-sm ml-4`}>
                    {getStatusText(project.status)}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">อาจารย์ที่ปรึกษา:</span>
                    <span>{project.advisor}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">สมาชิก:</span>
                    <span>{project.members.join(", ")}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">วันที่สร้าง:</span>
                    <span>{new Date(project.createdDate).toLocaleDateString("th-TH")}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">แก้ไขล่าสุด:</span>
                    <span>{new Date(project.lastModified).toLocaleDateString("th-TH")}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/projects/${project.id}`} className="flex-1">
                    <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                      ดูรายละเอียด
                    </button>
                  </Link>
                  <Link href={`/projects/${project.id}/edit`}>
                    <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
                      แก้ไข
                    </button>
                  </Link>
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
