"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserInfo } from "@/utils/auth";
import { 
  Users, FileText, CheckCircle, Clock, 
  AlertCircle, MessageCircle, FolderOpen, 
  ClipboardList, File 
} from "lucide-react";

type Student = {
  id: string;
  name: string;
  student_id: string;
  project_title?: string;
  project_status?: string;
  last_activity?: string;
};

type PendingFile = {
  id: string;
  file_name: string;
  student_name: string;
  project_title: string;
  uploaded_at: string;
  file_category: string;
};

type RecentMessage = {
  id: string;
  student_name: string;
  project_title: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

export default function AdvisorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const userInfo = getUserInfo();
    setUser(userInfo);
    loadAdvisorData();
  }, []);

  const loadAdvisorData = async () => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API || "http://localhost:8081";

      if (!token) {
        window.location.href = '/login';
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Load projects assigned to this advisor
      try {
        const projectsResponse = await fetch(`${baseUrl}/api/projects`, {
          headers
        });
        
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          // Filter projects where this user is the advisor (will be handled by backend based on JWT)
          const studentsWithProjects = projectsData.slice(0, 5).map((project: any) => ({
            id: project.id,
            name: project.student?.user?.full_name || 'ไม่มีชื่อ',
            student_id: project.student?.user?.student_id || 'ไม่มีรหัส',
            project_title: project.title || 'ไม่มีชื่อโปรเจค',
            project_status: project.status || 'pending',
            last_activity: project.updated_at || project.created_at,
          }));
          setStudents(studentsWithProjects);
        } else if (projectsResponse.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } catch (err) {
        console.log('Error loading students:', err);
        setStudents([]);
      }

      // Load recent files (using the files/recent endpoint we created)
      try {
        const filesResponse = await fetch(`${baseUrl}/api/files/recent?limit=5`, {
          headers
        });
        
        if (filesResponse.ok) {
          const filesData = await filesResponse.json();
          const pendingFilesData = filesData.map((file: any) => ({
            id: file.id,
            file_name: file.file_name || 'ไม่มีชื่อไฟล์',
            student_name: file.project?.student?.user?.full_name || 'ไม่มีชื่อ',
            project_title: file.project?.title || 'ไม่มีโปรเจค',
            uploaded_at: file.created_at,
            file_category: file.file_category || 'general',
          }));
          setPendingFiles(pendingFilesData);
        } else if (filesResponse.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } catch (err) {
        console.log('Error loading pending files:', err);
        setPendingFiles([]);
      }

      // Load recent notifications/messages
      try {
        const notificationsResponse = await fetch(`${baseUrl}/api/notifications?limit=5`, {
          headers
        });
        
        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json();
          const messagesData = notificationsData.map((notification: any) => ({
            id: notification.id,
            student_name: notification.user?.full_name || 'ไม่มีชื่อ',
            project_title: notification.project?.title || 'ไม่มีโปรเจค',
            message: notification.message || notification.title,
            created_at: notification.created_at,
            is_read: notification.is_read || false,
          }));
          setRecentMessages(messagesData);
        }
      } catch (err) {
        console.log('Error loading messages:', err);
        setRecentMessages([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading advisor data:", error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      proposal: "bg-gray-100 text-gray-800",
      approved: "bg-green-100 text-green-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-purple-100 text-purple-800",
      cancelled: "bg-red-100 text-red-800",
    };
    const statusText = {
      proposal: "ร่าง",
      approved: "อนุมัติ",
      in_progress: "กำลังดำเนินการ",
      completed: "เสร็จสิ้น",
      cancelled: "ยกเลิก",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges] || badges.proposal}`}>
        {statusText[status as keyof typeof statusText] || status}
      </span>
    );
  };

  const getCategoryText = (category: string) => {
    const categories = {
      progress_report: "รายงานความก้าวหน้า",
      final_report: "รายงานฉบับสุดท้าย",
      source_code: "ซอร์สโค้ด",
      documentation: "เอกสารประกอบ",
      presentation: "งานนำเสนอ",
      other: "อื่นๆ",
    };
    return categories[category as keyof typeof categories] || category;
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
          <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ดอาจารย์ที่ปรึกษา</h1>
          <p className="mt-2 text-gray-600">ยินดีต้อนรับ {user?.fullName}</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">การดำเนินการด่วน</h3>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/advisor/pending-projects"
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <ClipboardList className="w-4 h-4" />
                <span>ดูโปรเจคที่รอการอนุมัติ</span>
              </Link>
              <Link
                href="/advisor/files/review"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FileText className="w-4 h-4" />
                <span>ตรวจสอบไฟล์</span>
              </Link>
              <Link
                href="/advisor/students"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Users className="w-4 h-4" />
                <span>จัดการนักศึกษา</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">นักศึกษาในความดูแล</p>
                <p className="text-2xl font-semibold text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">ไฟล์รอตรวจ</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingFiles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">ข้อความใหม่</p>
                <p className="text-2xl font-semibold text-gray-900">{recentMessages.filter(m => !m.is_read).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">โครงงานเสร็จสิ้น</p>
                <p className="text-2xl font-semibold text-gray-900">{students.filter(s => s.project_status === "completed").length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Students */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">นักศึกษาในความดูแล</h3>
                <Link
                  href="/advisor/students"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  ดูทั้งหมด
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-500">รหัสนักศึกษา: {student.student_id}</p>
                        <p className="text-sm text-gray-600 mt-1">{student.project_title || "ยังไม่มีโครงงาน"}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          กิจกรรมล่าสุด: {new Date(student.last_activity || "").toLocaleDateString("th-TH")}
                        </p>
                      </div>
                      <div className="ml-4">
                        {student.project_status && getStatusBadge(student.project_status)}
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Link
                        href={`/advisor/projects/${student.id}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        ดูโครงงาน
                      </Link>
                      <Link
                        href={`/advisor/chat/${student.id}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        แชท
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pending Files */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">ไฟล์รอตรวจสอบ</h3>
                <Link
                  href="/advisor/files"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  ดูทั้งหมด
                </Link>
              </div>
            </div>
            <div className="p-6">
              {pendingFiles.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">ไม่มีไฟล์รอตรวจสอบ</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{file.file_name}</h4>
                          <p className="text-sm text-gray-500">{file.student_name}</p>
                          <p className="text-sm text-gray-600">{file.project_title}</p>
                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                            <span>{getCategoryText(file.file_category)}</span>
                            <span>{new Date(file.uploaded_at).toLocaleDateString("th-TH")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Link
                          href={`/advisor/files/${file.id}/review`}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                        >
                          ตรวจสอบ
                        </Link>
                        <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          ดาวน์โหลด
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-lg shadow lg:col-span-2">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">ข้อความล่าสุด</h3>
                <Link
                  href="/advisor/messages"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  ดูทั้งหมด
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">ไม่มีข้อความใหม่</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg border ${
                        message.is_read ? "bg-gray-50" : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900">{message.student_name}</h4>
                            <span className="text-xs text-gray-500">{message.project_title}</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{message.message}</p>
                          <p className="mt-2 text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleString("th-TH")}
                          </p>
                        </div>
                        {!message.is_read && (
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
