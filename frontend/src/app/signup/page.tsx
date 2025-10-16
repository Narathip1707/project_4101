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
import { UserPlus, User, Mail, Lock, Phone, IdCard, Briefcase, ShieldAlert, Loader2, LogIn } from "lucide-react";

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

      const response = await fetch(`http://localhost:8081/api/signup`, {
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
      <Card className="w-full max-w-md animate-scaleIn transform transition-all duration-500 hover:scale-100 hover:shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center animate-fadeInDown animate-delay-200 flex items-center justify-center gap-3">
            <UserPlus className="w-8 h-8 text-green-600" />
            <span>ลงทะเบียน</span>
          </CardTitle>
          <CardDescription className="text-center animate-fadeInUp animate-delay-300">
            สร้างบัญชีใหม่เพื่อเข้าใช้งานระบบ
          </CardDescription>
        </CardHeader>
        <CardContent className="animate-fadeInUp animate-delay-400">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name with animation */}
            <div className="space-y-2 animate-fadeInLeft animate-delay-500 transform transition-all duration-300 hover:scale-100">
              <Label htmlFor="fullName" className="font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>ชื่อ-นามสกุล</span>
              </Label>
              <Input
                id="fullName"
                placeholder="กรุณาใส่ชื่อ-นามสกุล"
                {...register("fullName")}
                className={cn(
                  "transition-all duration-300 transform hover:scale-100 focus:scale-100 hover:shadow-md focus:shadow-lg",
                  errors.fullName && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                )}
              />
              {errors.fullName && (
                <div className="flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-500 animate-fadeInUp">{errors.fullName.message}</p>
                </div>
              )}
            </div>

            {/* Role with animation */}
            <div className="space-y-2 animate-fadeInRight animate-delay-600 transform transition-all duration-300 hover:scale-100">
              <Label htmlFor="role" className="font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>สถานะ</span>
              </Label>
              <Select 
                onValueChange={(value: string) => setValue("role", value as "student" | "advisor")}
                defaultValue="student"
              >
                <SelectTrigger className={cn(
                  "transition-all duration-300 transform hover:scale-100 focus:scale-100 hover:shadow-md focus:shadow-lg",
                  errors.role && "border-red-500 focus:ring-red-500 animate-pulse"
                )}>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">นักศึกษา</SelectItem>
                  <SelectItem value="advisor">อาจารย์</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <div className="flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-500 animate-fadeInUp">{errors.role.message}</p>
                </div>
              )}
            </div>

            {/* Student ID / Employee ID with conditional animations */}
            {role === "student" && (
              <div className="space-y-2 animate-fadeInLeft animate-delay-700 transform transition-all duration-300 hover:scale-100">
                <Label htmlFor="studentId" className="font-medium flex items-center gap-2">
                  <IdCard className="w-4 h-4 text-blue-600" />
                  <span>รหัสนักศึกษา</span>
                </Label>
                <Input
                  id="studentId"
                  placeholder="กรุณาใส่รหัสนักศึกษา"
                  {...register("studentId")}
                  className={cn(
                    "transition-all duration-300 transform hover:scale-100 focus:scale-100 hover:shadow-md focus:shadow-lg",
                    errors.studentId && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                  )}
                />
                {errors.studentId && (
                  <div className="flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-500 animate-fadeInUp">{errors.studentId.message}</p>
                </div>
                )}
              </div>
            )}

            {role === "advisor" && (
              <div className="space-y-2 animate-fadeInRight animate-delay-700 transform transition-all duration-300 hover:scale-100">
                <Label htmlFor="employeeId" className="font-medium flex items-center gap-2">
                  <IdCard className="w-4 h-4 text-blue-600" />
                  <span>รหัสอาจารย์</span>
                </Label>
                <Input
                  id="employeeId"
                  placeholder="กรุณาใส่รหัสอาจารย์"
                  {...register("employeeId")}
                  className={cn(
                    "transition-all duration-300 transform hover:scale-100 focus:scale-100 hover:shadow-md focus:shadow-lg",
                    errors.employeeId && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                  )}
                />
                {errors.employeeId && (
                  <div className="flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-500 animate-fadeInUp">{errors.employeeId.message}</p>
                </div>
                )}
              </div>
            )}

            {/* Phone with animation */}
            <div className="space-y-2 animate-fadeInLeft animate-delay-800 transform transition-all duration-300 hover:scale-100">
              <Label htmlFor="phone" className="font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>เบอร์โทรศัพท์</span>
              </Label>
              <Input
                id="phone"
                placeholder="กรุณาใส่เบอร์โทรศัพท์"
                {...register("phone")}
                className={cn(
                  "transition-all duration-300 transform hover:scale-100 focus:scale-100 hover:shadow-md focus:shadow-lg",
                  errors.phone && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                )}
              />
              {errors.phone && (
                <div className="flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-500 animate-fadeInUp">{errors.phone.message}</p>
                </div>
              )}
            </div>

            {/* Email with animation */}
            <div className="space-y-2 animate-fadeInRight animate-delay-900 transform transition-all duration-300 hover:scale-100">
              <Label htmlFor="email" className="font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>อีเมล</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="กรุณาใส่อีเมล @rumail.ru.ac.th"
                {...register("email")}
                className={cn(
                  "transition-all duration-300 transform hover:scale-100 focus:scale-100 hover:shadow-md focus:shadow-lg",
                  errors.email && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                )}
              />
              {errors.email && (
                <div className="flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-500 animate-fadeInUp">{errors.email.message}</p>
                </div>
              )}
            </div>

            {/* Password with animation */}
            <div className="space-y-2 animate-fadeInLeft animate-delay-1000 transform transition-all duration-300 hover:scale-100">
              <Label htmlFor="password" className="font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>รหัสผ่าน</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="กรุณาใส่รหัสผ่าน"
                {...register("password")}
                className={cn(
                  "transition-all duration-300 transform hover:scale-100 focus:scale-100 hover:shadow-md focus:shadow-lg",
                  errors.password && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                )}
              />
              {errors.password && (
                <div className="flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-500 animate-fadeInUp">{errors.password.message}</p>
                </div>
              )}
            </div>

            {/* Confirm Password with animation */}
            <div className="space-y-2 animate-fadeInRight animate-delay-1100 transform transition-all duration-300 hover:scale-100">
              <Label htmlFor="confirmPassword" className="font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>ยืนยันรหัสผ่าน</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="กรุณาใส่รหัสผ่านอีกครั้ง"
                {...register("confirmPassword")}
                className={cn(
                  "transition-all duration-300 transform hover:scale-100 focus:scale-100 hover:shadow-md focus:shadow-lg",
                  errors.confirmPassword && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                )}
              />
              {errors.confirmPassword && (
                <div className="flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-500 animate-fadeInUp">{errors.confirmPassword.message}</p>
                </div>
              )}
            </div>

            {/* Root Error with animation */}
            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 animate-fadeInUp animate-delay-300">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />
                  <p className="text-sm text-red-600">{errors.root.message}</p>
                </div>
              </div>
            )}

            {/* Submit Button with enhanced animations */}
            <Button 
              type="submit" 
              className="w-full animate-slideInFromBottom animate-delay-1200 transition-all duration-300 transform hover:scale-100 hover:shadow-xl" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังลงทะเบียน...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span>ลงทะเบียน</span>
                </div>
              )}
            </Button>
          </form>

          {/* Login Link with animation */}
          <div className="mt-6 text-center animate-fadeInUp animate-delay-1300">
            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
              <span>มีบัญชีอยู่แล้ว?</span>
              <Link 
                href="/login" 
                className="text-green-600 hover:text-green-800 font-medium hover:underline transition-all duration-300 transform hover:scale-110 inline-flex items-center gap-1"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบที่นี่</span>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
