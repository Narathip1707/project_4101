"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout, isAuthenticated, getUserInfo } from "@/utils/auth";
import { Button } from "@/components/ui/button";

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
    // Force refresh หน้าหลักเพื่อให้แสดง login form
    window.location.href = "/";
  };

  return (
    <nav className="bg-[rgba(4,9,30,1)] p-4 animate-fadeInDown">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-white text-lg font-bold hover-scale transition-all duration-300">
          <Image
            src="/ramkhamhaeng-logo.svg"
            alt="Ramkhamhaeng University Logo"
            width={100}
            height={100}
            className="h-12 w-12"
            priority
          />
          <span>Ramkhamhaeng University</span>
        </Link>
        <div className="flex items-center gap-2 animate-fadeInLeft animate-delay-200">
          {!isLoggedIn ? (
            <>
              <Button
                asChild
                className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md px-4"
              >
                <Link href="/login">🔐 เข้าสู่ระบบ</Link>
              </Button>
              <Button
                asChild
                className="rounded-full text-black border border-white/25 hover:bg-white/10 backdrop-blur-sm transition-all duration-200 px-4"
                variant="outline"
              >
                <Link href="/signup">📝 ลงทะเบียน</Link>
              </Button>
            </>
          ) : (
            <>
              <span className="text-white/80 animate-fadeInRight hidden sm:inline-block mr-2">
                👋 ยินดีต้อนรับ, {user?.fullName}
              </span>
              <Button
                asChild
                className="rounded-full text-black border border-white/25 hover:bg-white/1 hover:text-white backdrop-blur-sm transition-all duration-200 px-4"
                variant="outline"
              >
                <Link href="/profile">👤 โปรไฟล์</Link>
              </Button>
              <Button
                onClick={handleLogout}
                className="rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-all duration-200 shadow-sm hover:shadow-md px-4"
              >
                🚪 ออกจากระบบ
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}