"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  studentId: string;
  department: string;
  faculty: string;
  phone: string;
  year: string;
  profileImage?: string;
}

export default function Profile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      // Mock data - ในอนาคตจะเป็น API Call จริง
      const mockUser = {
        id: "1",
        fullName: "นาย ทดสอบ ระบบ",
        email: "test@email.ru.ac.th",
        studentId: "64114000000",
        department: "วิทยาการคอมพิวเตอร์",
        faculty: "วิทยาศาสตร์",
        phone: "081-234-5678",
        year: "4"
      };
      setUser(mockUser);
      setEditForm(mockUser);
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editForm) {
      setUser(editForm);
      setIsEditing(false);
      // ในอนาคตจะเป็น API Call เพื่อบันทึกข้อมูล
      alert("บันทึกข้อมูลเรียบร้อยแล้ว");
    }
  };

  const handleCancel = () => {
    setEditForm(user);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (editForm) {
      setEditForm({
        ...editForm,
        [field]: value
      });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-black">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-gray-600 mb-6">คุณต้องเข้าสู่ระบบเพื่อดูโปรไฟล์</p>
          <Link href="/login">
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
              เข้าสู่ระบบ
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl text-black">กำลังโหลดข้อมูล...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[rgba(13,33,57,255)] p-10 animate-fadeInDown">
        <h1 className="text-3xl font-bold text-center mb-2 text-white animate-fadeInUp animate-delay-200">
          👤 โปรไฟล์ของฉัน
        </h1>
        <p className="text-center text-white animate-fadeInUp animate-delay-300">
          จัดการข้อมูลส่วนตัวของคุณ
        </p>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Card */}
        <div className="bg-white shadow-lg rounded-lg p-8 mb-6 animate-scaleIn hover-lift">
          <div className="flex items-center justify-between mb-6 animate-fadeInLeft">
            <h2 className="text-2xl font-bold text-black">📋 ข้อมูลส่วนตัว</h2>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 hover-lift glow"
              >
                ✏️ แก้ไขข้อมูล
              </button>
            ) : (
              <div className="space-x-2 animate-fadeInRight">
                <button
                  onClick={handleSave}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 hover-lift"
                >
                  ✅ บันทึก
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-300 hover-lift"
                >
                  ❌ ยกเลิก
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Image */}
            <div className="md:col-span-2 flex justify-center mb-6">
              <div className="relative">
                <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-4xl text-gray-600">👤</span>
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-600">
                    📷
                  </button>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ-นามสกุล</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm?.fullName || ""}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-black text-black"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-black placeholder:text-black">{user.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 ">รหัสนักศึกษา</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm?.studentId || ""}
                  onChange={(e) => handleInputChange("studentId", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-black text-black"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-black placeholder:text-black">{user.studentId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm?.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-black text-black"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-black placeholder:text-black">{user.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm?.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-black text-black"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-black placeholder:text-black">{user.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ภาควิชา</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm?.department || ""}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-black text-black"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-black placeholder:text-black">{user.department}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">คณะ</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm?.faculty || ""}
                  onChange={(e) => handleInputChange("faculty", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-black text-black"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-black placeholder:text-black">{user.faculty}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ชั้นปี</label>
              {isEditing ? (
                <select
                  value={editForm?.year || ""}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-black text-black"
                >
                  <option value="1">ปี 1</option>
                  <option value="2">ปี 2</option>
                  <option value="3">ปี 3</option>
                  <option value="4">ปี 4</option>
                </select>
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-black placeholder:text-black">ปี {user.year}</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link href="/projects" className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-all duration-300 hover-lift animate-fadeInLeft animate-delay-800">
            <div className="text-center">
              <div className="text-3xl mb-2 animate-bounce-custom">📚</div>
              <h3 className="text-lg font-semibold text-black mb-2">โครงงานของฉัน</h3>
              <p className="text-gray-600 text-sm">ดูและจัดการโครงงานพิเศษ</p>
            </div>
          </Link>

          <Link href="/notifications" className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-all duration-300 hover-lift animate-fadeInUp animate-delay-900">
            <div className="text-center">
              <div className="text-3xl mb-2 animate-pulse-custom">🔔</div>
              <h3 className="text-lg font-semibold text-black mb-2">การแจ้งเตือน</h3>
              <p className="text-gray-600 text-sm">ดูการแจ้งเตือนและข่าวสาร</p>
            </div>
          </Link>

          <Link href="/settings" className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-all duration-300 hover-lift animate-fadeInRight animate-delay-1000">
            <div className="text-center">
              <div className="text-3xl mb-2 animate-spin-slow">⚙️</div>
              <h3 className="text-lg font-semibold text-black mb-2">ตั้งค่า</h3>
              <p className="text-gray-600 text-sm">จัดการการตั้งค่าระบบ</p>
            </div>
          </Link>
        </div>

        {/* Back to Home */}
        <div className="text-center animate-fadeInUp animate-delay-1100">
          <Link href="/">
            <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 hover-lift glow">
              🏠 กลับสู่หน้าหลัก
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
