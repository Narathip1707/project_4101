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