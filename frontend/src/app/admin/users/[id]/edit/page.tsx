'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { isAuthenticated, getUserInfo, getAuthHeaders } from '@/utils/auth';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  department: string;
  phone: string;
  student_id: string;
  employee_id: string;
  created_at: string;
}

interface EditUserForm {
  email: string;
  full_name: string;
  role: string;
  department: string;
  phone: string;
  student_id: string;
  employee_id: string;
  new_password: string;
  confirm_new_password: string;
}

export default function EditUserPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<EditUserForm>({
    email: '',
    full_name: '',
    role: 'student',
    department: 'วิทยาการคอมพิวเตอร์',
    phone: '',
    student_id: '',
    employee_id: '',
    new_password: '',
    confirm_new_password: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

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
    }
  }, [router]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchUser();
    }
  }, [isLoggedIn, userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API || "http://localhost:8081";
      const authHeaders = getAuthHeaders();
      const headers: Record<string, string> = {};
      
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization;
      }

      const response = await fetch(`${baseUrl}/api/admin/user/${userId}`, {
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('ไม่พบผู้ใช้ที่ต้องการแก้ไข');
        }
        throw new Error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      }

      const data = await response.json();
      
      if (!data.user) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }

      const userData = data.user;
      setUser(userData);
      setForm({
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        department: userData.department || 'วิทยาการคอมพิวเตอร์',
        phone: userData.phone || '',
        student_id: userData.student_id || '',
        employee_id: userData.employee_id || '',
        new_password: '',
        confirm_new_password: '',
      });
    } catch (error: any) {
      console.error('Error fetching user:', error);
      setErrors([error.message]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): string[] => {
    const newErrors: string[] = [];

    if (!form.email) newErrors.push('กรุณากรอกอีเมล');
    else if (!form.email.includes('@')) newErrors.push('รูปแบบอีเมลไม่ถูกต้อง');

    if (!form.full_name) newErrors.push('กรุณากรอกชื่อ-นามสกุล');

    if (!form.role) newErrors.push('กรุณาเลือกบทบาท');

    if (form.role === 'student' && !form.student_id) {
      newErrors.push('กรุณากรอกรหัสนักศึกษา');
    }

    if ((form.role === 'advisor' || form.role === 'admin') && !form.employee_id) {
      newErrors.push('กรุณากรอกรหัสพนักงาน');
    }

    // Password validation only if new password is provided
    if (form.new_password) {
      if (form.new_password.length < 6) {
        newErrors.push('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
      }
      if (form.new_password !== form.confirm_new_password) {
        newErrors.push('รหัสผ่านใหม่ไม่ตรงกัน');
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setErrors([]);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API || "http://localhost:8081";
      const authHeaders = getAuthHeaders();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization;
      }

      const payload: any = {
        email: form.email,
        full_name: form.full_name,
        role: form.role,
        department: form.department,
        phone: form.phone,
        student_id: form.role === 'student' ? form.student_id : '',
        employee_id: form.role !== 'student' ? form.employee_id : '',
      };

      // Only include password if provided
      if (form.new_password) {
        payload.password = form.new_password;
      }

      const response = await fetch(`${baseUrl}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      alert('อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว');
      router.push('/admin/users');
    } catch (error: any) {
      console.error('Error updating user:', error);
      setErrors([error.message]);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isLoggedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลผู้ใช้...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">ไม่พบข้อมูลผู้ใช้</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            กลับรายการผู้ใช้
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">แก้ไขข้อมูลผู้ใช้</h1>
              <p className="mt-1 text-sm text-gray-500">
                แก้ไขข้อมูลผู้ใช้: {user.full_name} ({user.email})
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/users')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              กลับรายการผู้ใช้
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {errors.length > 0 && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      พบข้อผิดพลาด:
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    อีเมล *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                    ชื่อ-นามสกุล *
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Role and Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    บทบาท *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="student">นักศึกษา</option>
                    <option value="advisor">อาจารย์ที่ปรึกษา</option>
                    <option value="admin">ผู้ดูแลระบบ</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                    ภาควิชา
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={form.department}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ID Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {form.role === 'student' && (
                  <div>
                    <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">
                      รหัสนักศึกษา *
                    </label>
                    <input
                      type="text"
                      id="student_id"
                      name="student_id"
                      value={form.student_id}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required={form.role === 'student'}
                    />
                  </div>
                )}

                {form.role !== 'student' && (
                  <div>
                    <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700">
                      รหัสพนักงาน *
                    </label>
                    <input
                      type="text"
                      id="employee_id"
                      name="employee_id"
                      value={form.employee_id}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required={form.role !== 'student'}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Password Change Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  เปลี่ยนรหัสผ่าน (ไม่บังคับ)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                      รหัสผ่านใหม่
                    </label>
                    <input
                      type="password"
                      id="new_password"
                      name="new_password"
                      value={form.new_password}
                      onChange={handleInputChange}
                      placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยน"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirm_new_password" className="block text-sm font-medium text-gray-700">
                      ยืนยันรหัสผ่านใหม่
                    </label>
                    <input
                      type="password"
                      id="confirm_new_password"
                      name="confirm_new_password"
                      value={form.confirm_new_password}
                      onChange={handleInputChange}
                      placeholder="ใส่รหัสผ่านใหม่อีกครั้ง"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="border-t border-gray-200 pt-6">
                <div className="text-sm text-gray-500">
                  <p>สร้างเมื่อ: {new Date(user.created_at).toLocaleDateString('th-TH')}</p>
                  <p>User ID: {user.id}</p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/admin/users')}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}