'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

interface Project {
  id: number
  title: string
  description: string
  category: string
  status: string
  created_at: string
  due_date: string
  advisor_id?: number
  advisor_name?: string
  student_id: number
  student_name?: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const projectId = params?.id as string

  useEffect(() => {
    if (projectId) {
      loadProject()
    }
  }, [projectId])

  const loadProject = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`http://localhost:8081/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('ไม่พบโปรเจคที่ระบุ')
        }
        throw new Error('Failed to fetch project')
      }

      const data = await response.json()
      setProject(data)
    } catch (error) {
      console.error('Failed to load project:', error)
      setError(error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลโปรเจคได้')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'
      case 'completed':
        return 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm'
      case 'rejected':
        return 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm'
      default:
        return 'bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm'
    }
  }

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'รอพิจารณา'
      case 'in_progress':
        return 'กำลังดำเนินการ'
      case 'completed':
        return 'เสร็จสิ้น'
      case 'rejected':
        return 'ถูกปฏิเสธ'
      default:
        return status || 'ไม่ระบุ'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'ไม่ระบุ'
    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'ไม่ระบุ'
    }
  }

  const formatDateShort = (dateString: string) => {
    if (!dateString) return 'ไม่ระบุ'
    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'ไม่ระบุ'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-4 justify-center">
              <Link href="/student/projects">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  กลับไปหน้าโปรเจค
                </button>
              </Link>
              <button 
                onClick={loadProject}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ลองใหม่
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">ไม่พบโปรเจค</h2>
            <p className="text-gray-600 mb-4">ไม่พบโปรเจคที่คุณกำลังค้นหา</p>
            <Link href="/student/projects">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                กลับไปหน้าโปรเจค
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/student/projects">
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                ← กลับ
              </button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                <span className={getStatusColor(project.status)}>
                  {getStatusText(project.status)}
                </span>
              </div>
              <p className="text-gray-600">รหัสโปรเจค: #{project.id}</p>
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">รายละเอียดโปรเจค</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {project.description || 'ไม่มีรายละเอียด'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">การจัดการโปรเจค</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href={`/student/projects/${project.id}/files`}>
                  <button className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-lg transition-colors">
                    <span>📁</span>
                    <span>จัดการไฟล์</span>
                  </button>
                </Link>
                <Link href={`/student/projects/${project.id}/chat`}>
                  <button className="w-full flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-lg transition-colors">
                    <span>💬</span>
                    <span>แชทกับอาจารย์</span>
                  </button>
                </Link>
                <button 
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-3 rounded-lg transition-colors"
                >
                  <span>🖨️</span>
                  <span>พิมพ์รายงาน</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลโปรเจค</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">หมวดหมู่</label>
                  <p className="text-gray-900">{project.category || 'ไม่ระบุ'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">วันที่สร้าง</label>
                  <p className="text-gray-900">{formatDate(project.created_at)}</p>
                </div>
                
                {project.due_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">กำหนดส่ง</label>
                    <p className="text-gray-900">{formatDateShort(project.due_date)}</p>
                  </div>
                )}
                
                {project.advisor_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">อาจารย์ที่ปรึกษา</label>
                    <p className="text-gray-900">{project.advisor_name}</p>
                  </div>
                )}
                
                {project.student_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">นักศึกษา</label>
                    <p className="text-gray-900">{project.student_name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ความคืบหน้า</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">สถานะปัจจุบัน</span>
                  <span className={getStatusColor(project.status)}>
                    {getStatusText(project.status)}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      project.status?.toLowerCase() === 'completed' ? 'bg-green-500 w-full' :
                      project.status?.toLowerCase() === 'in_progress' ? 'bg-blue-500 w-3/4' :
                      project.status?.toLowerCase() === 'pending' ? 'bg-yellow-500 w-1/4' :
                      'bg-gray-400 w-0'
                    }`}
                  ></div>
                </div>
                
                <div className="text-sm text-gray-600 text-center">
                  {project.status?.toLowerCase() === 'completed' ? '100% เสร็จสิ้น' :
                   project.status?.toLowerCase() === 'in_progress' ? '75% กำลังดำเนินการ' :
                   project.status?.toLowerCase() === 'pending' ? '25% รอพิจารณา' :
                   '0% เริ่มต้น'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}