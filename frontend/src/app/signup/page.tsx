"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InputField, SelectField, Button, ErrorMessage } from "@/components/FormComponents";

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "student",
    phone: "",
    studentId: "",
    employeeId: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: (e.target as HTMLInputElement).value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // validations
    if (!formData.fullName) return setError("กรุณาใส่ชื่อ-นามสกุล");
    if (!formData.email) return setError("กรุณาใส่อีเมล");
    if (!formData.password) return setError("กรุณาใส่รหัสผ่าน");
    if (formData.password !== formData.confirmPassword) return setError("รหัสผ่านไม่ตรงกัน");
    if (formData.role === "student" && !formData.studentId) return setError("กรุณาใส่รหัสนักศึกษา");
    if (formData.role === "advisor" && !formData.employeeId) return setError("กรุณาใส่รหัสอาจารย์");

    try {
      const body: any = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
        phone: formData.phone,
      };
      if (formData.role === "student") body.studentId = formData.studentId;
      if (formData.role === "advisor") body.employeeId = formData.employeeId;

      // Debug: แสดงข้อมูลที่ส่งไป backend
      console.log("Signup request body:", body);

      const response = await fetch(`http://localhost:8081/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to sign up");
      setError("");
      alert(data.message);
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-black">ลงทะเบียน</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="ชื่อ-นามสกุล" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="กรุณาใส่ชื่อ-นามสกุล" animationDelay="delay-75" />
          <SelectField
            label="สถานะ"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={[{ value: "student", label: "นักศึกษา" }, { value: "advisor", label: "อาจารย์" }]}
            animationDelay="delay-100"
          />
          {formData.role === "student" && (
            <InputField label="รหัสนักศึกษา" name="studentId" value={formData.studentId} onChange={handleChange} placeholder="กรุณาใส่รหัสนักศึกษา" animationDelay="delay-125" />
          )}
          {formData.role === "advisor" && (
            <InputField label="รหัสอาจารย์" name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="กรุณาใส่รหัสอาจารย์" animationDelay="delay-125" />
          )}
          <InputField label="เบอร์โทรศัพท์" name="phone" value={formData.phone} onChange={handleChange} placeholder="กรุณาใส่เบอร์โทรศัพท์" animationDelay="delay-150" />
          <InputField label="อีเมล" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="กรุณาใส่อีเมล @rumail.ru.ac.th" animationDelay="delay-200" />
          <InputField label="รหัสผ่าน" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="กรุณาใส่รหัสผ่าน" animationDelay="delay-300" />
          <InputField label="ยืนยันรหัสผ่าน" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="กรุณาใส่รหัสผ่านอีกครั้ง" animationDelay="delay-350" />

          <ErrorMessage message={error} />
          <Button type="submit" variant="primary" animationDelay="delay-500">ลงทะเบียน</Button>
        </form>
      </div>
    </div>
  );
}
