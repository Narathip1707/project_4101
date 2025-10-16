"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { User, IdCard, Mail, Phone, Building2, GraduationCap, Calendar, Edit3, Save, X, Camera, FileText, Bell, Settings, Home } from 'lucide-react';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  studentId: string;
  department: string;
  faculty: string;
  phone: string;
  year: string;
}

const profileSchema = z.object({
  fullName: z.string().min(1, "Please enter your full name"),
  email: z.string().min(1, "Please enter email").email("Invalid email format"),
  studentId: z.string().min(1, "Please enter student ID"),
  department: z.string().min(1, "Please enter department"),
  faculty: z.string().min(1, "Please enter faculty"),
  phone: z.string().min(1, "Please enter phone number"),
  year: z.string().min(1, "Please enter year"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      loadUserProfile();
    }
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({ ...user!, ...data });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      setError("root", { message: "Failed to update profile" });
    }
  };

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API || "http://localhost:8081";
      
      const response = await fetch(`${baseUrl}/api/profile`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const userData = await response.json();
        const formattedUser = {
          id: userData.id,
          fullName: userData.full_name || userData.fullName || 'ไม่มีชื่อ',
          email: userData.email || 'ไม่มีอีเมล',
          studentId: userData.student_id || userData.employee_id || 'ไม่มีรหัส',
          department: userData.department || 'ไม่ระบุแผนก',
          faculty: userData.faculty || 'ไม่ระบุคณะ',
          phone: userData.phone || 'ไม่ระบุเบอร์โทร',
          year: userData.year || userData.academic_year || 'ไม่ระบุปี',
          profileImage: userData.profile_image
        };
        setUser(formattedUser);
        setEditForm(formattedUser);
      } else {
        // Fallback to localStorage userInfo if API fails
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const fallbackUser = {
          id: userInfo.id || "1",
          fullName: userInfo.fullName || userInfo.full_name || "ไม่มีชื่อ",
          email: userInfo.email || "ไม่มีอีเมล",
          studentId: userInfo.studentId || userInfo.student_id || userInfo.employee_id || "ไม่มีรหัส",
          department: userInfo.department || "ไม่ระบุแผนก",
          faculty: userInfo.faculty || "ไม่ระบุคณะ",
          phone: userInfo.phone || "ไม่ระบุเบอร์โทร",
          year: userInfo.year || "ไม่ระบุปี"
        };
        setUser(fallbackUser);
        setEditForm(fallbackUser);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      // Use fallback data from localStorage
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const fallbackUser = {
        id: userInfo.id || "1",
        fullName: userInfo.fullName || userInfo.full_name || "ไม่มีชื่อ",
        email: userInfo.email || "ไม่มีอีเมล",
        studentId: userInfo.studentId || userInfo.student_id || userInfo.employee_id || "ไม่มีรหัส",
        department: userInfo.department || "ไม่ระบุแผนก",
        faculty: userInfo.faculty || "ไม่ระบุคณะ",
        phone: userInfo.phone || "ไม่ระบุเบอร์โทร",
        year: userInfo.year || "ไม่ระบุปี"
      };
      setUser(fallbackUser);
      setEditForm(fallbackUser);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editForm) {
      try {
        const token = localStorage.getItem("token");
        const baseUrl = process.env.NEXT_PUBLIC_API || "http://localhost:8081";
        
        const response = await fetch(`${baseUrl}/api/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            full_name: editForm.fullName,
            email: editForm.email,
            phone: editForm.phone,
            department: editForm.department,
            faculty: editForm.faculty,
            year: editForm.year
          })
        });
        
        if (response.ok) {
          setUser(editForm);
          // Update localStorage userInfo as well
          const currentUserInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
          const updatedUserInfo = {
            ...currentUserInfo,
            fullName: editForm.fullName,
            full_name: editForm.fullName,
            email: editForm.email,
            phone: editForm.phone,
            department: editForm.department,
            faculty: editForm.faculty,
            year: editForm.year
          };
          localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
        } else {
          console.error("Failed to update profile");
          alert("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่");
          return;
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        return;
      }
      
      setUser(editForm);
      setIsEditing(false);
      // ในอนาคตจะเป็น API Call เพื่อบันทึกข้อมูล
      alert("บันทึกข้อมูลเรียบร้อยแล้ว");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      reset(user);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 animate-fadeInUp">
        <Card className="w-full max-w-md animate-scaleIn">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl animate-fadeInDown">🚫 Access Denied</CardTitle>
            <CardDescription className="animate-fadeInUp animate-delay-200">Please login to view your profile</CardDescription>
          </CardHeader>
          <CardContent className="text-center animate-fadeInUp animate-delay-300">
            <Link href="/login">
              <Button className="transition-all duration-300 hover:scale-105 hover:shadow-lg">🔐 Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Card */}
        <div className="bg-white shadow-xl rounded-2xl p-8 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">ข้อมูลส่วนตัว</h2>
            </div>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                แก้ไขข้อมูล
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl group"
                >
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  บันทึก
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-gray-500 text-white px-5 py-2.5 rounded-xl hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl group"
                >
                  <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  ยกเลิก
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Image */}
            <div className="md:col-span-2 flex justify-center mb-6">
              <div className="relative group">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                  <User className="w-16 h-16 text-white" />
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </div>

            {/* Form Fields */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 text-blue-600" />
                ชื่อ-นามสกุล
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm?.fullName || ""}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-all duration-300"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-xl text-black">{user.fullName}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <IdCard className="w-4 h-4 text-purple-600" />
                รหัสนักศึกษา
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm?.studentId || ""}
                  onChange={(e) => handleInputChange("studentId", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-all duration-300"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-xl text-black">{user.studentId}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 text-red-600" />
                อีเมล
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm?.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-all duration-300"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-xl text-black">{user.email}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 text-green-600" />
                เบอร์โทรศัพท์
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm?.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-all duration-300"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-xl text-black">{user.phone}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                ภาควิชา
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm?.department || ""}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-all duration-300"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-xl text-black">{user.department}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="w-4 h-4 text-amber-600" />
                คณะ
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm?.faculty || ""}
                  onChange={(e) => handleInputChange("faculty", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-all duration-300"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-xl text-black">{user.faculty}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 text-pink-600" />
                ชั้นปี
              </label>
              {isEditing ? (
                <select
                  value={editForm?.year || ""}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-all duration-300"
                >
                  <option value="1">ปี 1</option>
                  <option value="2">ปี 2</option>
                  <option value="3">ปี 3</option>
                  <option value="4">ปี 4</option>
                </select>
              ) : (
                <p className="p-3 bg-gray-50 rounded-xl text-black">ปี {user.year}</p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link href="/projects" className="group bg-white shadow-lg rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors duration-300">
                <FileText className="w-8 h-8 text-blue-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">โครงงานของฉัน</h3>
              <p className="text-gray-600 text-sm">ดูและจัดการโครงงานพิเศษ</p>
            </div>
          </Link>

          <Link href="/notifications" className="group bg-white shadow-lg rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-100 transition-colors duration-300">
                <Bell className="w-8 h-8 text-amber-600 group-hover:scale-110 group-hover:animate-pulse transition-all duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">การแจ้งเตือน</h3>
              <p className="text-gray-600 text-sm">ดูการแจ้งเตือนและข่าวสาร</p>
            </div>
          </Link>

          <Link href="/settings" className="group bg-white shadow-lg rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-100 transition-colors duration-300">
                <Settings className="w-8 h-8 text-purple-600 group-hover:rotate-90 transition-all duration-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ตั้งค่า</h3>
              <p className="text-gray-600 text-sm">จัดการการตั้งค่าระบบ</p>
            </div>
          </Link>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/">
            <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl mx-auto group">
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              กลับสู่หน้าหลัก
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
