"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout, isAuthenticated, getUserInfo } from "@/utils/auth";

export default function Nav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ fullName: string } | null>(null);
  const router = useRouter();

  // ฟังก์ชันตรวจสอบสถานะการ login
  const checkAuthStatus = () => {
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);
    
    if (authenticated) {
      const userInfo = getUserInfo();
      setUser(userInfo || { fullName: "Test User" });
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
    router.push("/");
  };

  return (
    <nav className="bg-[rgba(4,9,30,1)] p-4 animate-fadeInDown">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-lg font-bold hover-scale transition-all duration-300">
          🏫 Ramkhamhaeng University
        </Link>
        <div className="space-x-4 animate-fadeInLeft animate-delay-200">
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
              <span className="text-white animate-fadeInRight">
                👋 ยินดีต้อนรับ, {user?.fullName}
              </span>
              <Link href="/profile" className="text-white hover:underline transition-all duration-300 hover:text-green-200">
                👤 โปรไฟล์
              </Link>
              <button
                onClick={handleLogout}
                className="text-white hover:underline transition-all duration-300 hover:text-red-200 hover-scale"
              >
                🚪 ออกจากระบบ
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}