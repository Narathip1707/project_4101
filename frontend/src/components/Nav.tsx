"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout, isAuthenticated, getUserInfo } from "@/utils/auth";

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
    <nav className="bg-[rgba(4,9,30,1)] p-4 animate-fadeInDown shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-lg font-bold hover-scale transition-all duration-300">
          🏫 Ramkhamhaeng University
        </Link>
        
        <div className="flex items-center space-x-6 animate-fadeInLeft animate-delay-200">
          {!isLoggedIn ? (
            <>
              <Link href="/login" className="text-white hover:underline transition-all duration-300 hover:text-blue-200">
                🔐 เข้าสู่ระบบ
              </Link>
              <Link href="/signup" className="text-white hover:underline transition-all duration-300 hover:text-green-200">
                📝 ลงทะเบียน
              </Link>
            </>
          ) : (
            <>
              {/* Main Navigation Menu */}
              <div className="hidden md:flex items-center space-x-4">
                <Link 
                  href={getDashboardLink()} 
                  className="text-white hover:underline transition-all duration-300 hover:text-blue-200"
                >
                  🏠 หน้าหลัก
                </Link>
                
                <Link 
                  href={getProjectsLink()} 
                  className="text-white hover:underline transition-all duration-300 hover:text-green-200"
                >
                  � โปรเจค
                </Link>
                
                <Link 
                  href="/notifications" 
                  className="text-white hover:underline transition-all duration-300 hover:text-yellow-200"
                >
                  🔔 การแจ้งเตือน
                </Link>
                
                <Link 
                  href="/profile" 
                  className="text-white hover:underline transition-all duration-300 hover:text-purple-200"
                >
                  👤 โปรไฟล์
                </Link>
              </div>

              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="text-white flex items-center space-x-2 hover:text-blue-200 transition-all duration-300"
                >
                  <span className="animate-fadeInRight">
                    👋 {user?.fullName}
                  </span>
                  <span className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}>
                    ⌄
                  </span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 animate-fadeInDown">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{user?.fullName}</div>
                      <div className="text-gray-500 capitalize">{user?.role === 'advisor' ? 'อาจารย์' : 'นักศึกษา'}</div>
                    </div>
                    
                    {/* Mobile Menu Items */}
                    <div className="md:hidden">
                      <Link 
                        href={getDashboardLink()}
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        🏠 หน้าหลัก
                      </Link>
                      <Link 
                        href={getProjectsLink()}
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        📁 โปรเจค
                      </Link>
                      <Link 
                        href="/notifications"
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        🔔 การแจ้งเตือน
                      </Link>
                    </div>
                    
                    <Link 
                      href="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      👤 โปรไฟล์
                    </Link>
                    
                    <hr className="my-1" />
                    
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      🚪 ออกจากระบบ
                    </button>
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
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </nav>
  );
}
