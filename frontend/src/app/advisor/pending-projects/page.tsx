'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { ClipboardList, Loader2, Check, X } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  status: string
  created_at: string
  student?: {
    user?: {
      full_name: string
      email: string
    }
  }
}

export default function PendingProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    loadPendingProjects();
  }, []);

  const loadPendingProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch('http://localhost:8081/api/advisors/pending-projects', {
        headers
      });
      
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        setError('ไม่สามารถโหลดรายการโปรเจคได้')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (projectId: string, comment: string = '') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`http://localhost:8081/api/advisors/projects/${projectId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment })
      })

      if (response.ok) {
        // Reload projects after approval
        loadPendingProjects()
        alert('อนุมัติโปรเจคเรียบร้อยแล้ว')
      } else {
        alert('ไม่สามารถอนุมัติโปรเจคได้')
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอนุมัติ')
    }
  }

  const handleReject = async (projectId: string, comment: string) => {
    if (!comment.trim()) {
      alert('กรุณาระบุเหตุผลในการปฏิเสธ')
      return
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`http://localhost:8081/api/advisors/projects/${projectId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment })
      })

      if (response.ok) {
        // Reload projects after rejection
        loadPendingProjects()
        alert('ปฏิเสธโปรเจคเรียบร้อยแล้ว')
      } else {
        alert('ไม่สามารถปฏิเสธโปรเจคได้')
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการปฏิเสธ')
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลด...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">โปรเจคที่รอการอนุมัติ</h1>
              <p className="text-gray-600 mt-2">รายการโปรเจคที่นักศึกษาส่งมาขออนุมัติ</p>
            </div>
            <Link href="/advisor/dashboard">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                กลับหน้าหลัก
              </button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Projects List */}
        <div className="space-y-6">
          {projects.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">ไม่มีโปรเจคที่รอการอนุมัติ</h3>
              <p className="text-gray-600">ขณะนี้ไม่มีโปรเจคใหม่ที่รอการพิจารณา</p>
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

interface ProjectCardProps {
  project: Project
  onApprove: (id: string, comment?: string) => void
  onReject: (id: string, comment: string) => void
}

function ProjectCard({ project, onApprove, onReject }: ProjectCardProps) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectComment, setRejectComment] = useState('')
  const [approveComment, setApproveComment] = useState('')

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
          <p className="text-gray-600 mb-4">{project.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <span className="font-medium">นักศึกษา:</span>
              <span className="ml-1">{project.student?.user?.full_name || 'ไม่ระบุ'}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">อีเมล:</span>
              <span className="ml-1">{project.student?.user?.email || 'ไม่ระบุ'}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">วันที่ส่ง:</span>
              <span className="ml-1">{new Date(project.created_at).toLocaleDateString('th-TH')}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-2 ml-6">
          <button
            onClick={() => onApprove(project.id, approveComment)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            ✓ อนุมัติ
          </button>
          <button
            onClick={() => setShowRejectForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            ✗ ปฏิเสธ
          </button>
        </div>
      </div>

      {/* Optional approve comment */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ความเห็นเพิ่มเติม (ไม่บังคับ)
        </label>
        <textarea
          value={approveComment}
          onChange={(e) => setApproveComment(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="เช่น ข้อเสนอแนะหรือคำแนะนำสำหรับนักศึกษา"
        />
      </div>

      {/* Reject form */}
      {showRejectForm && (
        <div className="border-t pt-4 mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            เหตุผลในการปฏิเสธ <span className="text-red-500">*</span>
          </label>
          <textarea
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            rows={3}
            placeholder="กรุณาระบุเหตุผลในการปฏิเสธโปรเจคนี้"
            required
          />
          <div className="flex space-x-3 mt-3">
            <button
              onClick={() => {
                onReject(project.id, rejectComment)
                setShowRejectForm(false)
                setRejectComment('')
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              ยืนยันการปฏิเสธ
            </button>
            <button
              onClick={() => {
                setShowRejectForm(false)
                setRejectComment('')
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  )
}