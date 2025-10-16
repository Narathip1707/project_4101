"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { login } from "@/utils/auth";
import { loginSchema, LoginFormData } from "@/utils/validationSchemas";
import AnimatedFormContainer from "@/components/forms/AnimatedFormContainer";
import EmailInput from "@/components/forms/EmailInput";
import PasswordInput from "@/components/forms/PasswordInput";
import SubmitButton from "@/components/forms/SubmitButton";
import Link from "next/link";
import { LogIn, UserPlus, ShieldAlert, Loader2 } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const url = `http://localhost:8081/api/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error || "Failed to login");
      
      // Debug: แสดงข้อมูลที่ได้จาก backend
      console.log("Login response data:", result);
      
      // ตรวจสอบว่า backend ส่งข้อมูล user และ token มาหรือไม่
      if (!result.user || !result.token) {
        throw new Error("No user data or token received from backend");
      }
      
      // บันทึกข้อมูล login และ redirect ตาม role (ใช้ JWT token จริง)
      const userData = result.user;
      console.log("User data for login:", userData);
      
      login(result.token, userData);
      
      // Redirect ไปหน้าหลัก (/)
      console.log("Login successful, redirecting to home page");
      router.push("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError("root", {
        type: "manual",
        message: errorMessage,
      });
    }
  };

  return (
    <AnimatedFormContainer
      title={
        <div className="flex items-center justify-center gap-3">
          <LogIn className="w-8 h-8 text-blue-600" />
          <span>เข้าสู่ระบบ</span>
        </div>
      }
      description="เข้าสู่ระบบจัดการโครงงานพิเศษ"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Input */}
        <EmailInput
          {...register("email")}
          error={errors.email?.message}
          animationClass="animate-fadeInLeft animate-delay-500"
        />

        {/* Password Input */}
        <PasswordInput
          {...register("password")}
          error={errors.password?.message}
          animationClass="animate-fadeInRight animate-delay-600"
        />

        {/* Root Error */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 animate-fadeInUp animate-delay-300">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <SubmitButton
          isSubmitting={isSubmitting}
          animationClass="animate-fadeInUp animate-delay-700"
          loadingText="กำลังเข้าสู่ระบบ..."
        >
          <div className="flex items-center justify-center gap-2">
            <LogIn className="w-5 h-5" />
            <span>เข้าสู่ระบบ</span>
          </div>
        </SubmitButton>

        {/* Link to Signup */}
        <div className="text-center animate-fadeInUp animate-delay-800">
          <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
            <span>ยังไม่มีบัญชี?</span>
            <Link
              href="/signup"
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors flex items-center gap-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>ลงทะเบียนที่นี่</span>
            </Link>
          </p>
        </div>
      </form>
    </AnimatedFormContainer>
  );
}
