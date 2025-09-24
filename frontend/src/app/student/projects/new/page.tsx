'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    due_date: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('http://localhost:8081/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          due_date: formData.due_date || null
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create project')
      }

      const newProject = await response.json()
      
      // Redirect to the new project page
      router.push(`/student/projects/${newProject.id}`)
      
    } catch (error) {
      console.error('Failed to create project:', error)
      setError(error instanceof Error ? error.message : 'ไม่สามารถสร้างโปรเจคได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/student/projects">
                <button className="text-gray-600 hover:text-gray-900 transition-colors">
                  ← กลับ
                </button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">สร้างโปรเจคใหม่</h1>
            </div>
            <p className="text-gray-600">กรอกข้อมูลโปรเจคที่คุณต้องการสร้าง</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อโปรเจค <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ระบุชื่อโปรเจค"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                คำอธิบายโปรเจค
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="อธิบายรายละเอียดของโปรเจค"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                หมวดหมู่
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">เลือกหมวดหมู่</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Database">Database</option>
                <option value="Network">Network</option>
                <option value="Security">Security</option>
                <option value="Other">อื่นๆ</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">
                วันที่กำหนดส่ง
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <Link href="/student/projects" className="flex-1">
                <button
                  type="button"
                  className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.title.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? 'กำลังสร้าง...' : 'สร้างโปรเจค'}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">💡 คำแนะนำ</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• ตั้งชื่อโปรเจคให้ชัดเจนและเข้าใจง่าย</li>
              <li>• อธิบายรายละเอียดโปรเจคให้ครบถ้วน</li>
              <li>• เลือกหมวดหมู่ที่เหมาะสมเพื่อง่ายต่อการจัดการ</li>
              <li>• กำหนดวันที่ส่งเพื่อช่วยในการวางแผน</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
