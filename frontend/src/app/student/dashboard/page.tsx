"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserInfo } from "@/utils/auth";
import { 
  BookOpen, FileText, Bell, Award, Eye, FolderOpen, MessageSquare, 
  Plus, Clock, CheckCircle, XCircle, AlertCircle, Loader2
} from 'lucide-react';

type Project = {
  id: string;
  title: string;
  description?: string;
  status: string;
  advisor_name?: string;
  start_date?: string;
  end_date?: string;
  grade?: string;
};

type FileItem = {
  id: string;
  file_name: string;
  file_category: string;
  file_status: string;
  uploaded_at?: string;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = getUserInfo();
    setUser(userInfo);
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API || "http://localhost:8081";
      
      if (!token) {
        console.error("No authentication token found");
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Load student's projects data
      const projectsResponse = await fetch(`${baseUrl}/api/projects`, {
        headers
      });
      
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        // Backend returns { data: [], total, page, limit }
        const projects = Array.isArray(projectsData) ? projectsData : (projectsData.data || []);
        const formattedProjects = projects.slice(0, 5).map((project: any) => ({
          id: project.id,
          title: project.title || 'ไม่มีชื่อโครงงาน',
          description: project.description || 'ไม่มีคำอธิบาย',
          status: project.status || 'pending',
          advisor_name: project.advisor?.user?.full_name || 'ยังไม่ได้กำหนดอาจารย์ที่ปรึกษา',
          start_date: project.start_date || project.created_at,
          end_date: project.expected_end_date,
          grade: project.grade
        }));
        setProjects(formattedProjects);
      } else {
        console.error("Failed to fetch projects:", projectsResponse.status);
        setProjects([]);
      }
      
      // Load recent files
      try {
        const filesResponse = await fetch(`${baseUrl}/api/files/recent?limit=5`, {
          headers
        });
        
        if (filesResponse.ok) {
          const filesData = await filesResponse.json();
          setRecentFiles(filesData);
        } else {
          setRecentFiles([]);
        }
      } catch (error) {
        console.error("Error loading files:", error);
        setRecentFiles([]);
      }
      
      // Load notifications
      try {
        const notificationsResponse = await fetch(`${baseUrl}/api/notifications?limit=5`, {
          headers
        });
        
        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json();
          setNotifications(notificationsData || []);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
        setNotifications([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading student data:", error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-purple-100 text-purple-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    const statusText = {
      pending: "รอการอนุมัติ",
      approved: "อนุมัติแล้ว",
      rejected: "ถูกปฏิเสธ",
      in_progress: "กำลังดำเนินการ",
      completed: "เสร็จสิ้น",
      cancelled: "ยกเลิก",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges] || badges.pending}`}>
        {statusText[status as keyof typeof statusText] || status}
      </span>
    );
  };

  const getFileStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    const statusText = {
      pending: "รอการตรวจ",
      approved: "อนุมัติ",
      rejected: "ไม่อนุมัติ",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges] || badges.pending}`}>
        {statusText[status as keyof typeof statusText] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ดนักศึกษา</h1>
          <p className="mt-2 text-gray-600">ยินดีต้อนรับ <span className="font-semibold text-blue-600">{user?.fullName}</span></p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                  <BookOpen className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">โครงงานของฉัน</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors duration-300">
                  <FileText className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">ไฟล์ที่อัปโหลด</p>
                <p className="text-2xl font-bold text-gray-900">{recentFiles.length}</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors duration-300">
                  <Bell className="w-6 h-6 text-amber-600 group-hover:scale-110 group-hover:animate-pulse transition-all duration-300" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">การแจ้งเตือนใหม่</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.filter(n => !n.is_read).length}</p>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors duration-300">
                  <Award className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">เกรดเฉลี่ย</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Projects */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">โครงงานของฉัน</h3>
              </div>
            </div>
            <div className="p-6">
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">ยังไม่มีโครงงาน</p>
                  <Link
                    href="/student/projects/new"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    เริ่มโครงงานใหม่
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="group border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{project.title}</h4>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.description}</p>
                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>อาจารย์: {project.advisor_name || "ยังไม่ได้รับมอบหมาย"}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(project.status)}
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          href={`/student/projects/${project.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-300"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          ดูรายละเอียด
                        </Link>
                        <Link
                          href={`/student/projects/${project.id}/files`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-300"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          จัดการไฟล์
                        </Link>
                        <Link
                          href={`/student/projects/${project.id}/chat`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-300"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          แชทกับอาจารย์
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Files */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">ไฟล์ล่าสุด</h3>
              </div>
            </div>
            <div className="p-6">
              {recentFiles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">ยังไม่มีไฟล์ที่อัปโหลด</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors duration-300">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{file.file_name}</h4>
                          <p className="text-xs text-gray-500">
                            {new Date(file.uploaded_at || "").toLocaleDateString("th-TH")}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {getFileStatusBadge(file.file_status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow-xl lg:col-span-2 border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-gray-900">การแจ้งเตือน</h3>
                </div>
                <Link
                  href="/notifications"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  ดูทั้งหมด →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">ไม่มีการแจ้งเตือน</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.slice(0, 3).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        notification.is_read 
                          ? "bg-gray-50 border-gray-200" 
                          : "bg-blue-50 border-blue-200 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          notification.is_read ? "bg-gray-200" : "bg-blue-100"
                        }`}>
                          <Bell className={`w-5 h-5 ${notification.is_read ? "text-gray-500" : "text-blue-600"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900">{notification.title}</h4>
                          <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                          <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(notification.created_at).toLocaleString("th-TH")}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="flex-shrink-0">
                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
