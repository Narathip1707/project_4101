'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, FileText, Calendar, Clock, User, FolderOpen, MessageCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"

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
}

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('http://localhost:8081/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }

      const data = await response.json()
      setProjects(data || [])
    } catch (error) {
      console.error('Failed to load projects:', error)
      setError('ไม่สามารถโหลดข้อมูลโปรเจคได้')
      // Fallback to empty array on error
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs'
      case 'completed':
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs'
      case 'rejected':
        return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs'
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs'
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
        day: 'numeric'
      })
    } catch {
      return 'ไม่ระบุ'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">โปรเจคของฉัน</h1>
              <p className="text-gray-600">จัดการและติดตามโปรเจคทั้งหมดของคุณ</p>
            </div>
            <Link href="/student/projects/new">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>สร้างโปรเจคใหม่</span>
              </button>
            </Link>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
              <button 
                onClick={loadProjects} 
                className="mt-2 border border-red-300 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-50 flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ลองใหม่</span>
              </button>
            </div>
          )}

          {/* Projects Grid */}
          {projects.length === 0 && !error ? (
            <div className="bg-white rounded-lg p-12 text-center shadow-sm">
              <div className="text-gray-400 mb-4">
                <FileText className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ยังไม่มีโปรเจค
              </h3>
              <p className="text-gray-600 mb-4">
                เริ่มต้นสร้างโปรเจคแรกของคุณเลย
              </p>
              <Link href="/student/projects/new">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto">
                  <Plus className="w-5 h-5" />
                  <span>สร้างโปรเจคใหม่</span>
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
                      <span className={getStatusColor(project.status)}>
                        {getStatusText(project.status)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-600 mb-4 text-sm">
                    {project.description || 'ไม่มีคำอธิบาย'}
                  </p>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>สร้างเมื่อ: {formatDate(project.created_at)}</span>
                    </div>
                    {project.due_date && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>กำหนดส่ง: {formatDate(project.due_date)}</span>
                      </div>
                    )}
                    {project.advisor_name && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">อาจารย์ที่ปรึกษา: </span>
                        <span>{project.advisor_name}</span>
                      </div>
                    )}
                    {project.category && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">หมวดหมู่: </span>
                        <span>{project.category}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/student/projects/${project.id}`} className="flex-1">
                      <button className="w-full border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-50 transition-colors">
                        ดูรายละเอียด
                      </button>
                    </Link>
                    <Link href={`/student/projects/${project.id}/files`}>
                      <button className="border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-50 transition-colors">
                        <FolderOpen className="w-4 h-4" />
                      </button>
                    </Link>
                    <Link href={`/student/projects/${project.id}/chat`}>
                      <button className="border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-50 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
