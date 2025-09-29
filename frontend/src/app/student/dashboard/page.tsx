"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserInfo } from "@/utils/auth";

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
      
      // Load real projects data
      const projectsResponse = await fetch(`${baseUrl}/api/projects?limit=5`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        const formattedProjects = projectsData.map((project: any) => ({
          id: project.id,
          title: project.title || 'ไม่มีชื่อโปรเจค',
          description: project.description || 'ไม่มีคำอธิบาย',
          status: project.status || 'proposal',
          advisor_name: project.advisor?.user?.full_name || 'ยังไม่ได้กำหนดอาจารย์',
          start_date: project.start_date || project.created_at,
        }));
        setProjects(formattedProjects);
      } else {
        // Fallback to empty array if API fails
        setProjects([]);
      }
      
      // Load recent files - for now, use empty array since we need specific user's files
      // TODO: Add API endpoint for user's recent files
      setRecentFiles([]);
      
      // Load notifications
      const notificationsResponse = await fetch(`${baseUrl}/api/notifications?limit=5`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData);
      } else {
        // Fallback to empty array
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ดนักศึกษา</h1>
          <p className="mt-2 text-gray-600">ยินดีต้อนรับ {user?.fullName}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📚</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">โครงงานของฉัน</p>
                <p className="text-2xl font-semibold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📄</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">ไฟล์ที่อัปโหลด</p>
                <p className="text-2xl font-semibold text-gray-900">{recentFiles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">🔔</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">การแจ้งเตือนใหม่</p>
                <p className="text-2xl font-semibold text-gray-900">{notifications.filter(n => !n.is_read).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">⭐</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">เกรดเฉลี่ย</p>
                <p className="text-2xl font-semibold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Projects */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">โครงงานของฉัน</h3>
            </div>
            <div className="p-6">
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">ยังไม่มีโครงงาน</p>
                  <Link
                    href="/student/projects/new"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    เริ่มโครงงานใหม่
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{project.title}</h4>
                          <p className="mt-1 text-sm text-gray-500">{project.description}</p>
                          <div className="mt-2 flex items-center space-x-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <span>อาจารย์ที่ปรึกษา: {project.advisor_name || "ยังไม่ได้รับมอบหมาย"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(project.status)}
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Link
                          href={`/student/projects/${project.id}`}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          ดูรายละเอียด
                        </Link>
                        <Link
                          href={`/student/projects/${project.id}/files`}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          จัดการไฟล์
                        </Link>
                        <Link
                          href={`/student/projects/${project.id}/chat`}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
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
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">ไฟล์ล่าสุด</h3>
            </div>
            <div className="p-6">
              {recentFiles.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">ยังไม่มีไฟล์ที่อัปโหลด</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{file.file_name}</h4>
                        <p className="text-sm text-gray-500">
                          อัปโหลดเมื่อ {new Date(file.uploaded_at || "").toLocaleDateString("th-TH")}
                        </p>
                      </div>
                      <div className="ml-4">
                        {getFileStatusBadge(file.file_status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow lg:col-span-2">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">การแจ้งเตือน</h3>
                <Link
                  href="/notifications"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  ดูทั้งหมด
                </Link>
              </div>
            </div>
            <div className="p-6">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">ไม่มีการแจ้งเตือน</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.slice(0, 3).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.is_read ? "bg-gray-50" : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                          <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                          <p className="mt-2 text-xs text-gray-500">
                            {new Date(notification.created_at).toLocaleString("th-TH")}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="ml-4">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
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
