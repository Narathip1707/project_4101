'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FileReview {
  id: string;
  file_name: string;
  file_size: number;
  file_category: string;
  uploaded_at: string;
  student_name: string;
  student_id: string;
  project_title: string;
  project_id: string;
  file_status: 'pending' | 'approved' | 'rejected';
  description?: string;
}

export default function FilesReviewPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadPendingFiles();
  }, [router]);

  const loadPendingFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Load recent files that need review
      const response = await fetch('http://localhost:8081/api/files/recent?limit=10', {
        headers
      });

      if (response.ok) {
        const filesData = await response.json();
        const formattedFiles = filesData.map((file: any) => ({
          id: file.id,
          file_name: file.file_name || 'ไม่มีชื่อไฟล์',
          file_size: file.file_size || 0,
          file_category: file.file_category || 'general',
          uploaded_at: file.created_at,
          student_name: file.project?.student?.user?.full_name || 'ไม่มีชื่อ',
          student_id: file.project?.student?.user?.student_id || 'ไม่มีรหัส',
          project_title: file.project?.title || 'ไม่มีโปรเจค',
          project_id: file.project?.id || '',
          file_status: file.file_status || 'pending',
          description: file.description || ''
        }));
        setFiles(formattedFiles);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        setError('ไม่สามารถโหลดรายการไฟล์ได้');
      }
    } catch (err) {
      console.error('Error loading files:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'อนุมัติแล้ว';
      case 'rejected':
        return 'ปฏิเสธแล้ว';
      case 'pending':
      default:
        return 'รอการรีวิว';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/advisor/dashboard">
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                ← กลับ Dashboard
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">รีวิวไฟล์</h1>
          </div>
          <p className="text-gray-600">รายการไฟล์ที่นักเรียนส่งมาเพื่อขอรีวิวจากอาจารย์</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Files List */}
        <div className="bg-white rounded-lg shadow-sm">
          {files.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                📁
              </div>
              <p className="text-gray-500 text-lg">ไม่มีไฟล์ที่ต้องรีวิวในขณะนี้</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ไฟล์
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      นักเรียน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      โปรเจค
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่อัปโหลด
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">📄</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {file.file_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatFileSize(file.file_size)} • {file.file_category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {file.student_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {file.student_id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {file.project_title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(file.file_status)}`}>
                          {getStatusText(file.file_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(file.uploaded_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/advisor/files/${file.id}/review`}>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors">
                              รีวิว
                            </button>
                          </Link>
                          <Link href={`/student/projects/${file.project_id}`}>
                            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm transition-colors">
                              ดูโปรเจค
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {files.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">
                {files.filter(f => f.file_status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">รอรีวิว</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {files.filter(f => f.file_status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">อนุมัติแล้ว</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-red-600">
                {files.filter(f => f.file_status === 'rejected').length}
              </div>
              <div className="text-sm text-gray-600">ปฏิเสธแล้ว</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}