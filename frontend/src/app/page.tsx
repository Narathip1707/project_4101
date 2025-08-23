"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ fullName: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true); //test
      setUser({ fullName: "Test User" }); // เปลี่ยนเป็น API Call จริง
    }
  }, []);

  if (isLoggedIn && user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-[rgba(13,33,57,255)] p-10">
          <h1 className="text-3xl font-bold text-center mb-6 text-white placeholder:to-black">ยินดีต้อนรับ, {user.fullName}!</h1>
          <p className="text-center mb-4 text-white placeholder:to-black">หน้าโฮมของระบบจัดการโครงงานพิเศษ</p>
        </div>
        <div className="mt-10 text-center">
          <h1 className="text-4xl font-semibold inline-block pb-2">
            ตัวอย่างโครงงานพิเศษ
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6v m-6">
          {[
            { title: "การ์ดที่ 1", desc: "รายละเอียดของการ์ดนี้", link: "/card1-details" },
            { title: "การ์ดที่ 2", desc: "รายละเอียดของการ์ดนี้", link: "/card2-details" },
            { title: "การ์ดที่ 3", desc: "รายละเอียดของการ์ดนี้", link: "/card3-details" },
          ].map((card, idx) => (
            <div key={idx} className="m-2 bg-white shadow-lg p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">{card.title}</h2>
                <p className="text-gray-600 mb-4">{card.desc}</p>
              </div>
              <Link href={card.link}>
                <button className="mt-auto bg-blue-500 text-white text-sm px-3 py-1 hover:bg-blue-600">
                  Read More
                </button>
              </Link>
            </div>
          ))}
        </div>
        <div className="border-t-2 border-gray-300 m-10"></div>
        <div className="flex justify-center gap-4 max-w-4xl mx-auto p-6">
          <a
            href="/projects"
            className="bg-blue-500 text-white p-4 hover:bg-blue-600 text-center flex-1"
          >
            ดูโครงงาน
          </a>
          <a
            href="/profile"
            className="bg-green-500 text-white p-4 hover:bg-green-600 text-center flex-1"
          >
            จัดการโปรไฟล์
          </a>
          <a
            href="/notifications"
            className="bg-yellow-500 text-white p-4 hover:bg-yellow-600 text-center flex-1"
          >
            ดูการแจ้งเตือน
          </a>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center text-black">
        <h1 className="text-3xl font-bold mb-4">ระบบจัดการโครงงานพิเศษ</h1>
        <p className="text-2xl mb-4">กรุณาเข้าสู่ระบบหรือลงทะเบียนเพื่อเริ่มต้น</p>
        <div className="flex justify-center space-x-4">
          <Link href="/login" className="text-blue-500 hover:underline">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              เข้าสู่ระบบ
            </button>
          </Link>
          <Link href="/signup" className="text-blue-500 hover:underline ml-4">
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
              ลงทะเบียน
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}