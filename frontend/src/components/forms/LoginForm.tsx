"use client"

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          เข้าสู่ระบบ
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📧 อีเมล
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
              <p className="text-red-500 text-sm mt-1">
                ❌ {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔒 รหัสผ่าน
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
              <p className="text-red-500 text-sm mt-1">
                ❌ {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? '🔄 กำลังเข้าสู่ระบบ...' : '🔐 เข้าสู่ระบบ'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ยังไม่มีบัญชี?{" "}
            <a href="/signup" className="text-blue-500 hover:text-blue-700 transition-colors duration-300 font-medium">
              ลงทะเบียน
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}