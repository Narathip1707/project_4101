"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout, FormContainer, LinkText } from "@/components/LayoutComponents";
import { InputField, SelectField, Button, ErrorMessage } from "@/components/FormComponents";

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
    <AuthLayout title="📝 ลงทะเบียน">
      <FormContainer onSubmit={handleSubmit}>
        <InputField
          label="ชื่อ-นามสกุล"
          icon="👤"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="กรุณาใส่ชื่อ-นามสกุล"
          required
          animationDelay="animate-delay-100"
        />
        
        <SelectField
          label="สถานะ"
          icon="🎓"
          name="role"
          value={formData.role}
          onChange={handleChange}
          options={[
            { value: "student", label: "นักศึกษา" },
            { value: "advisor", label: "อาจารย์" }
          ]}
          animationDelay="animate-delay-200"
        />
        
        <InputField
          label="เบอร์โทรศัพท์"
          icon="📱"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="กรุณาใส่เบอร์โทรศัพท์"
          animationDelay="animate-delay-300"
        />
        
        <InputField
          label="อีเมล"
          icon="📧"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="กรุณาใส่อีเมล @rumail.ru.ac.th"
          required
          animationDelay="animate-delay-400"
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
          animationDelay="animate-delay-500"
        />
        
        <ErrorMessage message={error} />
        
        <Button
          type="submit"
          animationDelay="animate-delay-600"
        >
          ✅ ลงทะเบียน
        </Button>
      </FormContainer>
      
      <LinkText
        text="มีบัญชีแล้ว?"
        linkText="🔐 เข้าสู่ระบบที่นี่"
        href="/login"
        animationDelay="animate-delay-700"
      />
    </AuthLayout>
  );
}