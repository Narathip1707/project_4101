"use client"

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Mail, Lock, LogIn, Loader2, UserPlus, ShieldAlert } from 'lucide-react'

// Zod schema สำหรับ validation
const loginSchema = z.object({
  email: z.string().email('กรุณากรอกอีเมลที่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    console.log('Form data:', data)
    // จำลองการส่งข้อมูล
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('เข้าสู่ระบบสำเร็จ!')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-6">
          <LogIn className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">
            เข้าสู่ระบบ
          </h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>อีเมล</span>
            </label>
            <input
              type="email"
              {...register('email')}
              className={cn(
                "mt-1 block w-full border rounded-md shadow-sm p-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300",
                errors.email ? "border-red-500" : "border-gray-300"
              )}
              placeholder="กรอกอีเมลของคุณ"
            />
            {errors.email && (
              <div className="flex items-center gap-1 mt-1">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <p className="text-red-500 text-sm">
                  {errors.email.message}
                </p>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>รหัสผ่าน</span>
            </label>
            <input
              type="password"
              {...register('password')}
              className={cn(
                "mt-1 block w-full border rounded-md shadow-sm p-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300",
                errors.password ? "border-red-500" : "border-gray-300"
              )}
              placeholder="กรอกรหัสผ่านของคุณ"
            />
            {errors.password && (
              <div className="flex items-center gap-1 mt-1">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังเข้าสู่ระบบ...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ</span>
              </div>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <span>ยังไม่มีบัญชี?</span>
            <a href="/signup" className="text-blue-500 hover:text-blue-700 transition-colors duration-300 font-medium flex items-center gap-1">
              <UserPlus className="w-4 h-4" />
              <span>ลงทะเบียน</span>
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}