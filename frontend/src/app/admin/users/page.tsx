'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserInfo, getAuthHeaders } from '@/utils/auth';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department?: string;
  phone?: string;
  student_id?: string;
  employee_id?: string;
  is_verified: boolean;
  created_at: string;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AdminUsersPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
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
      loadUsers();
    }
  }, [router, currentPage, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API || "http://localhost:8081";
      const authHeaders = getAuthHeaders();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);

      const response = await fetch(`${baseUrl}/api/admin/users?${params}`, { headers });
      
      if (!response.ok) throw new Error('Failed to load users');
      
      const data: UsersResponse = await response.json();
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ ${userEmail}?`)) {
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API || "http://localhost:8081";
      const authHeaders = getAuthHeaders();
      const headers: Record<string, string> = {};
      
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization;
      }

      const response = await fetch(`${baseUrl}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) throw new Error('Failed to delete user');

      alert('ลบผู้ใช้เรียบร้อยแล้ว');
      loadUsers(); // Reload users list
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('เกิดข้อผิดพลาดในการลบผู้ใช้');
    }
  };

  const resetPassword = async (userId: string, userEmail: string) => {
    const newPassword = prompt(`กำหนดรหัสผ่านใหม่สำหรับ ${userEmail}:`);
    if (!newPassword || newPassword.length < 6) {
      alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API || "http://localhost:8081";
      const authHeaders = getAuthHeaders();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization;
      }

      const response = await fetch(`${baseUrl}/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) throw new Error('Failed to reset password');

      alert('รีเซ็ตรหัสผ่านเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
    }
  };

  if (loading) {
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
              <h1 className="text-3xl font-bold text-gray-900">จัดการผู้ใช้</h1>
              <p className="mt-1 text-sm text-gray-500">
                จัดการบัญชีผู้ใช้ทั้งหมดในระบบ
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/admin/users/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                เพิ่มผู้ใช้ใหม่
              </button>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                กลับแดชบอร์ด
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  ค้นหา
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="ค้นหาด้วยอีเมลหรือชื่อ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  กรองตามบทบาท
                </label>
                <select
                  id="role"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="admin">ผู้ดูแลระบบ</option>
                  <option value="advisor">อาจารย์ที่ปรึกษา</option>
                  <option value="student">นักศึกษา</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('');
                    setCurrentPage(1);
                  }}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  ล้างตัวกรอง
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ผู้ใช้
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      บทบาท
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ภาควิชา
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
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800'
                            : user.role === 'advisor'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role === 'admin' ? 'ผู้ดูแล' : user.role === 'advisor' ? 'อาจารย์' : 'นักศึกษา'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.department || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_verified 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.is_verified ? 'ยืนยันแล้ว' : 'รอยืนยัน'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                            className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => resetPassword(user.id, user.email)}
                            className="text-yellow-600 hover:text-yellow-900 text-xs px-2 py-1 border border-yellow-600 rounded hover:bg-yellow-50 transition-colors"
                          >
                            รีเซ็ตรหัส
                          </button>
                          <button
                            onClick={() => deleteUser(user.id, user.email)}
                            className="text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-600 rounded hover:bg-red-50 transition-colors"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className="text-gray-500">ไม่พบผู้ใช้</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6">
                <div className="flex-1 flex justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ก่อนหน้า
                  </button>
                  <span className="text-sm text-gray-700">
                    หน้า {currentPage} จาก {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}