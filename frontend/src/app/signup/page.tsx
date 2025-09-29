"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Zod schema สำหรับ validation
const signupSchema = z.object({
  fullName: z.string().min(1, "กรุณากรอกชื่อ-นามสกุล"),
  role: z.enum(["student", "advisor"]),
  studentId: z.string().optional(),
  employeeId: z.string().optional(),
  phone: z.string().min(1, "กรุณากรอกเบอร์โทรศัพท์"),
  email: z
    .string()
    .min(1, "กรุณากรอกอีเมล")
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .refine((email) => email.endsWith("@rumail.ru.ac.th"), {
      message: "อีเมลต้องเป็นของมหาวิทยาลัยรามคำแหง (@rumail.ru.ac.th)",
    }),
  password: z
    .string()
    .min(1, "กรุณากรอกรหัสผ่าน")
    .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === "student" && !data.studentId) {
    return false;
  }
  if (data.role === "advisor" && !data.employeeId) {
    return false;
  }
  return true;
}, {
  message: "กรุณากรอกรหัสนักศึกษาหรือรหัสอาจารย์",
  path: ["studentId"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignUp() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "student",
    },
  });

  const role = watch("role");

  const onSubmit = async (data: SignupFormData) => {
    try {
      const body: any = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: data.role,
        phone: data.phone,
      };
      
      if (data.role === "student") body.studentId = data.studentId;
      if (data.role === "advisor") body.employeeId = data.employeeId;

      // Debug: แสดงข้อมูลที่ส่งไป backend
      console.log("Signup request body:", body);

      const response = await fetch(`http://localhost:8080/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to sign up");
      }
      
      alert(result.message);
      router.push("/login");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      setError("root", { message: errorMessage });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4 animate-fadeInUp">
      <Card className="w-full max-w-md animate-scaleIn transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center animate-fadeInDown animate-delay-200">
            📝 ลงทะเบียน
          </CardTitle>
          <CardDescription className="text-center animate-fadeInUp animate-delay-300">
            สร้างบัญชีใหม่เพื่อเข้าใช้งานระบบ
          </CardDescription>
        </CardHeader>
        <CardContent className="animate-fadeInUp animate-delay-400">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name with animation */}
            <div className="space-y-2 animate-fadeInLeft animate-delay-500 transform transition-all duration-300 hover:scale-105">
              <Label htmlFor="fullName" className="font-medium">👤 ชื่อ-นามสกุล</Label>
              <Input
                id="fullName"
                placeholder="กรุณาใส่ชื่อ-นามสกุล"
                {...register("fullName")}
                className={cn(
                  "transition-all duration-300 transform hover:scale-105 focus:scale-105 hover:shadow-md focus:shadow-lg",
                  errors.fullName && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                )}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500 animate-fadeInUp">❌ {errors.fullName.message}</p>
              )}
            </div>

            {/* Role with animation */}
            <div className="space-y-2 animate-fadeInRight animate-delay-600 transform transition-all duration-300 hover:scale-105">
              <Label htmlFor="role" className="font-medium">📋 สถานะ</Label>
              <Select 
                onValueChange={(value) => setValue("role", value as "student" | "advisor")}
                defaultValue="student"
              >
                <SelectTrigger className={cn(
                  "transition-all duration-300 transform hover:scale-105 focus:scale-105 hover:shadow-md focus:shadow-lg",
                  errors.role && "border-red-500 focus:ring-red-500 animate-pulse"
                )}>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">🎓 นักศึกษา</SelectItem>
                  <SelectItem value="advisor">👨‍🏫 อาจารย์</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500 animate-fadeInUp">❌ {errors.role.message}</p>
              )}
            </div>

            {/* Student ID / Employee ID with conditional animations */}
            {role === "student" && (
              <div className="space-y-2 animate-fadeInLeft animate-delay-700 transform transition-all duration-300 hover:scale-105">
                <Label htmlFor="studentId" className="font-medium">🆔 รหัสนักศึกษา</Label>
                <Input
                  id="studentId"
                  placeholder="กรุณาใส่รหัสนักศึกษา"
                  {...register("studentId")}
                  className={cn(
                    "transition-all duration-300 transform hover:scale-105 focus:scale-105 hover:shadow-md focus:shadow-lg",
                    errors.studentId && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                  )}
                />
                {errors.studentId && (
                  <p className="text-sm text-red-500 animate-fadeInUp">❌ {errors.studentId.message}</p>
                )}
              </div>
            )}

            {role === "advisor" && (
              <div className="space-y-2 animate-fadeInRight animate-delay-700 transform transition-all duration-300 hover:scale-105">
                <Label htmlFor="employeeId" className="font-medium">🆔 รหัสอาจารย์</Label>
                <Input
                  id="employeeId"
                  placeholder="กรุณาใส่รหัสอาจารย์"
                  {...register("employeeId")}
                  className={cn(
                    "transition-all duration-300 transform hover:scale-105 focus:scale-105 hover:shadow-md focus:shadow-lg",
                    errors.employeeId && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                  )}
                />
                {errors.employeeId && (
                  <p className="text-sm text-red-500 animate-fadeInUp">❌ {errors.employeeId.message}</p>
                )}
              </div>
            )}

            {/* Phone with animation */}
            <div className="space-y-2 animate-fadeInLeft animate-delay-800 transform transition-all duration-300 hover:scale-105">
              <Label htmlFor="phone" className="font-medium">📱 เบอร์โทรศัพท์</Label>
              <Input
                id="phone"
                placeholder="กรุณาใส่เบอร์โทรศัพท์"
                {...register("phone")}
                className={cn(
                  "transition-all duration-300 transform hover:scale-105 focus:scale-105 hover:shadow-md focus:shadow-lg",
                  errors.phone && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                )}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 animate-fadeInUp">❌ {errors.phone.message}</p>
              )}
            </div>

            {/* Email with animation */}
            <div className="space-y-2 animate-fadeInRight animate-delay-900 transform transition-all duration-300 hover:scale-105">
              <Label htmlFor="email" className="font-medium">📧 อีเมล</Label>
              <Input
                id="email"
                type="email"
                placeholder="กรุณาใส่อีเมล @rumail.ru.ac.th"
                {...register("email")}
                className={cn(
                  "transition-all duration-300 transform hover:scale-105 focus:scale-105 hover:shadow-md focus:shadow-lg",
                  errors.email && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                )}
              />
              {errors.email && (
                <p className="text-sm text-red-500 animate-fadeInUp">❌ {errors.email.message}</p>
              )}
            </div>

            {/* Password with animation */}
            <div className="space-y-2 animate-fadeInLeft animate-delay-1000 transform transition-all duration-300 hover:scale-105">
              <Label htmlFor="password" className="font-medium">🔒 รหัสผ่าน</Label>
              <Input
                id="password"
                type="password"
                placeholder="กรุณาใส่รหัสผ่าน"
                {...register("password")}
                className={cn(
                  "transition-all duration-300 transform hover:scale-105 focus:scale-105 hover:shadow-md focus:shadow-lg",
                  errors.password && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                )}
              />
              {errors.password && (
                <p className="text-sm text-red-500 animate-fadeInUp">❌ {errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password with animation */}
            <div className="space-y-2 animate-fadeInRight animate-delay-1100 transform transition-all duration-300 hover:scale-105">
              <Label htmlFor="confirmPassword" className="font-medium">🔒 ยืนยันรหัสผ่าน</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="กรุณาใส่รหัสผ่านอีกครั้ง"
                {...register("confirmPassword")}
                className={cn(
                  "transition-all duration-300 transform hover:scale-105 focus:scale-105 hover:shadow-md focus:shadow-lg",
                  errors.confirmPassword && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                )}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 animate-fadeInUp">❌ {errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Root Error with animation */}
            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 animate-fadeInUp animate-delay-300">
                <p className="text-sm text-red-600 animate-pulse">❌ {errors.root.message}</p>
              </div>
            )}

            {/* Submit Button with enhanced animations */}
            <Button 
              type="submit" 
              className="w-full animate-slideInFromBottom animate-delay-1200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="animate-pulse">กำลังลงทะเบียน...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span className="animate-bounce">✅</span>
                  <span>ลงทะเบียน</span>
                </span>
              )}
            </Button>
          </form>

          {/* Login Link with animation */}
          <div className="mt-6 text-center animate-fadeInUp animate-delay-1300">
            <p className="text-sm text-gray-600">
              มีบัญชีอยู่แล้ว?{" "}
              <Link 
                href="/login" 
                className="text-green-600 hover:text-green-800 font-medium hover:underline transition-all duration-300 transform hover:scale-110 inline-block"
              >
                <span className="flex items-center space-x-1">
                  <span className="animate-pulse">🔐</span>
                  <span>เข้าสู่ระบบที่นี่</span>
                </span>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}