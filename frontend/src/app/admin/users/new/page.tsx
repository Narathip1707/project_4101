'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserInfo, getAuthHeaders } from '@/utils/auth';

interface CreateUserForm {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  role: string;
  department: string;
  phone: string;
  student_id: string;
  employee_id: string;
}

export default function CreateUserPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateUserForm>({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'student',
    department: 'วิทยาการคอมพิวเตอร์',
    phone: '',
    student_id: '',
    employee_id: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
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
    }
  }, [router]);

  const validateForm = (): string[] => {
    const newErrors: string[] = [];

    if (!form.email) newErrors.push('กรุณากรอกอีเมล');
    else if (!form.email.includes('@')) newErrors.push('รูปแบบอีเมลไม่ถูกต้อง');

    if (!form.password) newErrors.push('กรุณากรอกรหัสผ่าน');
    else if (form.password.length < 6) newErrors.push('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');

    if (form.password !== form.confirmPassword) newErrors.push('รหัสผ่านไม่ตรงกัน');

    if (!form.full_name) newErrors.push('กรุณากรอกชื่อ-นามสกุล');

    if (!form.role) newErrors.push('กรุณาเลือกบทบาท');

    if (form.role === 'student' && !form.student_id) {
      newErrors.push('กรุณากรอกรหัสนักศึกษา');
    }

    if ((form.role === 'advisor' || form.role === 'admin') && !form.employee_id) {
      newErrors.push('กรุณากรอกรหัสพนักงาน');
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

    setLoading(true);
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

      const payload = {
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        role: form.role,
        department: form.department,
        phone: form.phone,
        student_id: form.role === 'student' ? form.student_id : '',
        employee_id: form.role !== 'student' ? form.employee_id : '',
      };

      const response = await fetch(`${baseUrl}/api/admin/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      alert('สร้างผู้ใช้เรียบร้อยแล้ว');
      router.push('/admin/users');
    } catch (error: any) {
      console.error('Error creating user:', error);
      setErrors([error.message]);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">เพิ่มผู้ใช้ใหม่</h1>
              <p className="mt-1 text-sm text-gray-500">
                สร้างบัญชีผู้ใช้ใหม่ในระบบ
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
                    placeholder="example@rumail.ru.ac.th"
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
                    placeholder="นาย/นางสาว ชื่อ นามสกุล"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    รหัสผ่าน *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    ยืนยันรหัสผ่าน *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="ใส่รหัสผ่านอีกครั้ง"
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
                      placeholder="6504016665"
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
                      placeholder="E12345"
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
                    placeholder="081-234-5678"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
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
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'กำลังสร้าง...' : 'สร้างผู้ใช้'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}