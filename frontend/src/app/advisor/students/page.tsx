'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface StudentProgress {
  id: string;
  user_id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone?: string;
  project?: {
    id: string;
    title: string;
    status: 'pending' | 'approved' | 'in-progress' | 'completed' | 'rejected';
    progress_percentage: number;
    created_at: string;
    deadline?: string;
  } | null;
  last_activity: string;
  total_files: number;
  files_reviewed: number;
  files_pending: number;
  performance_score: number;
}

export default function StudentsManagementPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadStudents();
  }, [router]);

  const loadStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      console.log('Loading students with token:', token?.substring(0, 20) + '...');

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Load students under advisor supervision
      const response = await fetch('http://localhost:8081/api/advisors/students', {
        headers
      });

      console.log('API Response status:', response.status);
      console.log('API Response headers:', response.headers);

      if (response.ok) {
        const studentsData = await response.json();
        console.log('Students data:', studentsData);
        
        // Handle empty array or data structure
        if (!Array.isArray(studentsData)) {
          console.error('Expected array but got:', studentsData);
          setStudents([]);
        } else {
          const formattedStudents = studentsData.map((student: any) => ({
            id: student.id,
            user_id: student.user_id,
            student_id: student.user?.student_id || 'ไม่มีรหัส',
            full_name: student.user?.full_name || 'ไม่มีชื่อ',
            email: student.user?.email || '',
            phone: student.user?.phone || '',
            project: student.projects?.[0] ? {
              id: student.projects[0].id,
              title: student.projects[0].title,
              status: student.projects[0].status,
              progress_percentage: student.projects[0].progress_percentage || 0,
              created_at: student.projects[0].created_at,
              deadline: student.projects[0].deadline
            } : null,
            last_activity: student.last_activity || student.user?.created_at,
            total_files: student.project_files?.length || 0,
            files_reviewed: student.project_files?.filter((f: any) => f.file_status === 'approved').length || 0,
            files_pending: student.project_files?.filter((f: any) => f.file_status === 'pending').length || 0,
            performance_score: calculatePerformanceScore(student)
          }));
          setStudents(formattedStudents);
        }
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        setError(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error('Network error loading students:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
    } finally {
      setLoading(false);
    }
  };

  const calculatePerformanceScore = (student: any): number => {
    // Simple performance calculation based on project progress and file submissions
    let score = 0;
    
    if (student.projects?.[0]) {
      score += (student.projects[0].progress_percentage || 0) * 0.6; // 60% weight for progress
    }
    
    const totalFiles = student.project_files?.length || 0;
    const approvedFiles = student.project_files?.filter((f: any) => f.file_status === 'approved').length || 0;
    
    if (totalFiles > 0) {
      score += (approvedFiles / totalFiles) * 40; // 40% weight for file approval rate
    }
    
    return Math.min(100, Math.round(score));
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.project?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'with-project' && student.project) ||
                         (statusFilter === 'no-project' && !student.project) ||
                         (student.project?.status === statusFilter);
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.full_name.localeCompare(b.full_name);
      case 'progress':
        return (b.project?.progress_percentage || 0) - (a.project?.progress_percentage || 0);
      case 'performance':
        return b.performance_score - a.performance_score;
      case 'activity':
        return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
      default:
        return 0;
    }
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'approved':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'เสร็จสิ้น';
      case 'approved':
        return 'อนุมัติแล้ว';
      case 'in-progress':
        return 'กำลังดำเนินการ';
      case 'pending':
        return 'รอการอนุมัติ';
      case 'rejected':
        return 'ปฏิเสธ';
      default:
        return 'ไม่มีโปรเจค';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลนักศึกษา...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/advisor/dashboard">
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                ← กลับ Dashboard
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">จัดการนักศึกษา</h1>
          </div>
          <p className="text-gray-600">ติดตามความคืบหน้าและจัดการข้อมูลนักศึกษาที่อยู่ในความดูแล</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={loadStudents}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {/* Debug Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-700 text-sm">
            🔧 Debug: พบนักศึกษา {students.length} คน | 
            Token: {localStorage.getItem('token') ? 'มี' : 'ไม่มี'} | 
            API: {error ? 'Error' : 'OK'}
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหา</label>
              <input
                type="text"
                placeholder="ชื่อ, รหัสนักศึกษา หรือโปรเจค"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">ทั้งหมด</option>
                <option value="with-project">มีโปรเจค</option>
                <option value="no-project">ไม่มีโปรเจค</option>
                <option value="pending">รอการอนุมัติ</option>
                <option value="approved">อนุมัติแล้ว</option>
                <option value="in-progress">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="rejected">ปฏิเสธ</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">เรียงตาม</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">ชื่อ</option>
                <option value="progress">ความคืบหน้า</option>
                <option value="performance">คะแนนผลงาน</option>
                <option value="activity">กิจกรรมล่าสุด</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-end">
              <button
                onClick={loadStudents}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                🔄 รีเฟรช
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{students.length}</div>
            <div className="text-sm text-gray-600">นักศึกษาทั้งหมด</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {students.filter(s => s.project?.status === 'in-progress').length}
            </div>
            <div className="text-sm text-gray-600">กำลังทำโปรเจค</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">
              {students.filter(s => s.project?.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">รอการอนุมัติ</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              {students.filter(s => !s.project).length}
            </div>
            <div className="text-sm text-gray-600">ยังไม่มีโปรเจค</div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-lg shadow-sm">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                👥
              </div>
              <p className="text-gray-500 text-lg">
                {students.length === 0 ? 'ไม่พบนักศึกษาในระบบ' : 'ไม่พบนักศึกษาที่ตรงกับเงื่อนไขการค้นหา'}
              </p>
              {students.length === 0 && (
                <p className="text-gray-400 text-sm mt-2">
                  ตรวจสอบการเชื่อมต่อ API หรือสิทธิ์การเข้าถึง
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      นักศึกษา
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      โปรเจค
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ความคืบหน้า
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ไฟล์งาน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      คะแนนผลงาน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      กิจกรรมล่าสุด
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-600 font-medium">
                                {student.full_name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.student_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {student.project ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {student.project.title}
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.project.status)}`}>
                              {getStatusText(student.project.status)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">ยังไม่มีโปรเจค</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.project ? (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${student.project.progress_percentage}%` }}
                            ></div>
                            <div className="text-xs text-gray-600 mt-1">
                              {student.project.progress_percentage}%
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-1 text-xs">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            ทั้งหมด {student.total_files}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            ผ่าน {student.files_reviewed}
                          </span>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            รอ {student.files_pending}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-lg font-bold ${getPerformanceColor(student.performance_score)}`}>
                          {student.performance_score}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(student.last_activity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/advisor/students/${student.id}/edit`}>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors">
                              จัดการ
                            </button>
                          </Link>
                          {student.project && (
                            <Link href={`/student/projects/${student.project.id}`}>
                              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm transition-colors">
                                ดูโปรเจค
                              </button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}