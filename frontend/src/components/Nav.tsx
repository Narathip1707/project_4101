"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout, isAuthenticated, getUserInfo } from "@/utils/auth";
import { Home, FileText, Bell, User, LogIn, UserPlus, LogOut, ChevronDown, GraduationCap, Briefcase } from 'lucide-react';

export default function Nav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ fullName: string; role?: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  // ฟังก์ชันตรวจสอบสถานะการ login
  const checkAuthStatus = () => {
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);
    
    if (authenticated) {
      const userInfo = getUserInfo();
      setUser(userInfo || { fullName: "Test User", role: "student" });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // ตรวจสอบสถานะการ login เมื่อ component mount
    checkAuthStatus();

    // ฟัง storage event เพื่อรับการเปลี่ยนแปลงจาก tab อื่น
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        checkAuthStatus();
      }
    };

    // ฟัง custom event สำหรับการ login/logout ใน tab เดียวกัน
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    router.push("/");
  };

  const getDashboardLink = () => {
    if (user?.role === 'advisor') {
      return '/advisor/dashboard';
    }
    return '/student/dashboard';
  };

  const getProjectsLink = () => {
    if (user?.role === 'advisor') {
      return '/advisor/dashboard';
    }
    return '/student/projects';
  };

  return (
    <nav className="bg-[rgba(4,9,30,1)] p-4 animate-fadeInDown shadow-lg relative z-[100]">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 text-white text-lg font-bold hover-scale transition-all duration-300">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Emblem_of_Ramkhamhaeng_University%2C_BW.svg/256px-Emblem_of_Ramkhamhaeng_University%2C_BW.svg.png?20200602181442" 
            alt="Ramkhamhaeng University Logo"
            width="32"
            height="32"
            className="rounded bg-white/5 p-0.5 hover:bg-white/10 transition-all duration-300"
          />
          Ramkhamhaeng University
        </Link>

        <div className="flex items-center space-x-6 animate-fadeInLeft animate-delay-200">
          {!isLoggedIn ? (
            <>
              <Link href="/login" className="flex items-center gap-2 text-white hover:underline transition-all duration-300 hover:text-blue-200">
                <LogIn className="w-4 h-4" />
                เข้าสู่ระบบ
              </Link>
              <Link href="/signup" className="flex items-center gap-2 text-white hover:underline transition-all duration-300 hover:text-green-200">
                <UserPlus className="w-4 h-4" />
                ลงทะเบียน
              </Link>
            </>
          ) : (
            <>
              {/* Main Navigation Menu */}
              <div className="hidden md:flex items-center space-x-4">
                <Link 
                  href={getDashboardLink()} 
                  className="flex items-center gap-2 text-white hover:underline transition-all duration-300 hover:text-blue-200"
                >
                  <Home className="w-4 h-4" />
                  หน้าหลัก
                </Link>
                
                <Link 
                  href={getProjectsLink()} 
                  className="flex items-center gap-2 text-white hover:underline transition-all duration-300 hover:text-green-200"
                >
                  <FileText className="w-4 h-4" />
                  โปรเจค
                </Link>
                
                <Link 
                  href="/notifications" 
                  className="flex items-center gap-2 text-white hover:underline transition-all duration-300 hover:text-yellow-200"
                >
                  <Bell className="w-4 h-4" />
                  การแจ้งเตือน
                </Link>
                
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 text-white hover:underline transition-all duration-300 hover:text-purple-200"
                >
                  <User className="w-4 h-4" />
                  โปรไฟล์
                </Link>
              </div>

              {/* User Menu Dropdown */}
              <div className="relative z-[60]">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-300 backdrop-blur-sm relative z-[60]"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline animate-fadeInRight font-medium">
                    {user?.fullName}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-fadeInDown">
                    {/* User Info Header */}
                    <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {user?.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 truncate">{user?.fullName}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            {user?.role === 'advisor' ? (
                              <>
                                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-xs font-medium text-blue-600">อาจารย์</span>
                              </>
                            ) : (
                              <>
                                <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                                <span className="text-xs font-medium text-purple-600">นักศึกษา</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mobile Menu Items */}
                    <div className="md:hidden py-1">
                      <Link 
                        href={getDashboardLink()}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
                      >
                        <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">หน้าแรก</span>
                      </Link>
                      <Link 
                        href={getProjectsLink()}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200 group"
                      >
                        <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">โปรเจค</span>
                      </Link>
                      <Link 
                        href="/notifications"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-all duration-200 group"
                      >
                        <Bell className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">การแจ้งเตือน</span>
                      </Link>
                      <div className="my-1.5 border-t border-gray-200"></div>
                    </div>
                    
                    <div className="py-1">
                      <Link 
                        href="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 group"
                      >
                        <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">โปรไฟล์</span>
                      </Link>
                    </div>
                    
                    <div className="border-t border-gray-200"></div>
                    
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 group"
                      >
                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">ออกจากระบบ</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-[50]" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </nav>
  );
}
