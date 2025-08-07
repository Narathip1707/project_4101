"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "student",
    phone: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName) {
      setError("Please enter your full name");
      return;
    }
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    try {
      const url = `http://localhost:8080/api/signup`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to sign up");
      setError("");
      alert(data.message);
      router.push("/login");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">ลงทะเบียน</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="กรุณาใส่ชื่อ-นามสกุล"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">สถานะ</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="student">นักศึกษา</option>
              <option value="advisor">อาจารย์</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="กรุณาใส่เบอร์โทรศัพท์"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">อีเมล</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="กรุณาใส่อีเมล @rumail.ru.ac.th"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="กรุณาใส่รหัสผ่าน"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            ลงทะเบียน
          </button>
        </form>
      </div>
    </div>
  );
}