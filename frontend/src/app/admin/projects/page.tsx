'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserInfo, getAuthHeaders } from '@/utils/auth';
import { FolderKanban, Search, Filter, Eye, Trash2, CheckCircle, XCircle, Clock, User } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  student_id: string;
  student_name: string;
  advisor_id: string;
  advisor_name: string;
  created_at: string;
  updated_at: string;
}

interface ProjectsResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AdminProjectsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authenticated = isAuthenticated();
      const userInfo = getUserInfo();
      
      if (!authenticated) {
        router.push('/login');
        return;
      }
      
      if (userInfo?.role !== 'admin') {
        router.push('/');
        return;
      }
      
      setIsLoggedIn(true);
      loadProjects();
    }
  }, [router, currentPage, searchTerm, statusFilter]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API || "http://localhost:8081";
      const authHeaders = getAuthHeaders();
      const headers: Record<string, string> = {};
      
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`${baseUrl}/api/admin/projects?${params}`, { headers });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(`Failed to load projects: ${response.status}`);
      }
      
      const data: ProjectsResponse = await response.json();
      setProjects(data.projects || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string, projectTitle: string) => {
    if (!confirm(`คุณต้องการลบโครงงาน "${projectTitle}" หรือไม่?`)) {
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API || "http://localhost:8081";
      const authHeaders = getAuthHeaders();
      const headers: Record<string, string> = {};
      
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization;
      }

      const response = await fetch(`${baseUrl}/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) throw new Error('Failed to delete project');

      alert('ลบโครงงานเรียบร้อยแล้ว');
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('เกิดข้อผิดพลาดในการลบโครงงาน');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'รออนุมัติ', icon: Clock },
      'approved': { bg: 'bg-green-100', text: 'text-green-800', label: 'อนุมัติแล้ว', icon: CheckCircle },
      'rejected': { bg: 'bg-red-100', text: 'text-red-800', label: 'ไม่อนุมัติ', icon: XCircle },
      'in_progress': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'กำลังดำเนินการ', icon: Clock },
      'completed': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'เสร็จสิ้น', icon: CheckCircle },
    };

    const config = statusConfig[status] || statusConfig['pending'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FolderKanban className="w-8 h-8 text-purple-600" />
                จัดการโครงงาน
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                ดูและจัดการโครงงานทั้งหมดในระบบ
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              กลับแดชบอร์ด
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="w-4 h-4 inline mr-1" />
                  ค้นหา
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="ค้นหาชื่อโครงงาน, นักศึกษา, หรืออาจารย์..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  <Filter className="w-4 h-4 inline mr-1" />
                  กรองตามสถานะ
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="pending">รออนุมัติ</option>
                  <option value="approved">อนุมัติแล้ว</option>
                  <option value="rejected">ไม่อนุมัติ</option>
                  <option value="in_progress">กำลังดำเนินการ</option>
                  <option value="completed">เสร็จสิ้น</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setCurrentPage(1);
                }}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {projects.length === 0 && !loading ? (
            <div className="text-center py-16">
              <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">ไม่พบโครงงาน</p>
              <p className="text-gray-400 text-sm mt-2">ลองเปลี่ยนเงื่อนไขการค้นหาหรือกรอง</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        โครงงาน
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        นักศึกษา
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        อาจารย์ที่ปรึกษา
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สถานะ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่สร้าง
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        การดำเนินการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {project.title}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-2">
                              {project.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {project.student_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {project.student_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div className="text-sm text-gray-900">
                              {project.advisor_name || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(project.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(project.created_at).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => router.push(`/admin/projects/${project.id}`)}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900 text-xs px-2 py-1 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              ดู
                            </button>
                            <button
                              onClick={() => deleteProject(project.id, project.title)}
                              className="inline-flex items-center gap-1 text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-600 rounded hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ก่อนหน้า
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ถัดไป
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        หน้า <span className="font-medium">{currentPage}</span> จาก{' '}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ก่อนหน้า
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ถัดไป
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
