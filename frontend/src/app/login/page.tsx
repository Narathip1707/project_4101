"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/utils/auth";
import Link from "next/link";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    try {
      const url = `http://localhost:8080/api/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to login");
      setError("");
      
      // ใช้ฟังก์ชัน login helper แทน localStorage.setItem โดยตรง
      login("dummy-token", { fullName: "Test User", email: formData.email });
      
      router.push("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md animate-scaleIn hover-lift">
        <h1 className="text-3xl font-bold mb-6 text-center text-black animate-fadeInDown">
          🔐 เข้าสู่ระบบ
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="animate-fadeInLeft animate-delay-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">📧 อีเมล</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-black placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="กรุณาใส่อีเมล @rumail.ru.ac.th"
            />
          </div>
          <div className="animate-fadeInRight animate-delay-300">
            <label className="block text-sm font-medium text-gray-700 mb-2">🔒 รหัสผ่าน</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-black placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="กรุณาใส่รหัสผ่าน"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm animate-fadeInUp bg-red-50 p-3 rounded-md border border-red-200">
              ❌ {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-all duration-300 font-semibold hover-lift glow animate-fadeInUp animate-delay-400"
          >
            ✅ เข้าสู่ระบบ
          </button>
        </form>
        <div className="mt-6 text-center animate-fadeInUp animate-delay-500">
          <p className="text-gray-600">
            ยังไม่มีบัญชี?{" "}
            <Link href="/signup" className="text-blue-500 hover:text-blue-700 transition-colors duration-300 font-medium">
              📝 ลงทะเบียนที่นี่
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}