"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/utils/auth";
import { AuthLayout, FormContainer, LinkText } from "@/components/LayoutComponents";
import { InputField, Button, ErrorMessage } from "@/components/FormComponents";

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
      const url = `http://localhost:8081/api/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to login");
      setError("");
      
      // Debug: แสดงข้อมูลที่ได้จาก backend
      console.log("Login response data:", data);
      
      // ตรวจสอบว่า backend ส่งข้อมูล user มาหรือไม่
      if (!data.user) {
        throw new Error("No user data received from backend");
      }
      
      // บันทึกข้อมูล login และ redirect ตาม role (ใช้ข้อมูลจาก backend เท่านั้น)
      const userData = data.user;
      console.log("User data for login:", userData);
      
      login("dummy-token", userData);
      
      // Redirect ตาม role
      console.log("Redirecting based on role:", userData.role);
      if (userData.role === "student") {
        router.push("/student/dashboard");
      } else if (userData.role === "advisor") {
        router.push("/advisor/dashboard");
      } else if (userData.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    }
  };

  return (
    <AuthLayout title="🔐 เข้าสู่ระบบ">
      <FormContainer onSubmit={handleSubmit}>
        <InputField
          label="อีเมล"
          icon="📧"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="กรุณาใส่อีเมล @rumail.ru.ac.th"
          required
          animationDelay="animate-delay-200"
        />
        
        <InputField
          label="รหัสผ่าน"
          icon="🔒"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="กรุณาใส่รหัสผ่าน"
          required
          animationDelay="animate-delay-300"
        />
        
        <ErrorMessage message={error} />
        
        <Button
          type="submit"
          animationDelay="animate-delay-400"
        >
          ✅ เข้าสู่ระบบ
        </Button>
      </FormContainer>
      
      <LinkText
        text="ยังไม่มีบัญชี?"
        linkText="📝 ลงทะเบียนที่นี่"
        href="/signup"
        animationDelay="animate-delay-500"
      />
    </AuthLayout>
  );
}