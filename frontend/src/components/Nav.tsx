"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Nav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ fullName: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token"); // ตรวจสอบ Token จาก localStorage
    if (token) {
      setIsLoggedIn(true);
      setUser({ fullName: "Test User" }); // เปลี่ยนเป็น API Call จริงในอนาคต
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <nav className="bg-[rgba(4,9,30,1)] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-lg font-bold">
          Ramkhamhaeng University
        </Link>
        <div className="space-x-4">
          {!isLoggedIn ? (
            <>
              <Link href="/login" className="text-white hover:underline">
                เข้าสู่ระบบ
              </Link>
              <Link href="/signup" className="text-white hover:underline">
                ลงทะเบียน
              </Link>
            </>
          ) : (
            <>
              <span className="text-white">ยินดีต้อนรับ, {user?.fullName}</span>
              <Link href="/profile" className="text-white hover:underline">
                โปรไฟล์
              </Link>
              <button
                onClick={handleLogout}
                className="text-white hover:underline"
              >
                ออกจากระบบ
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}