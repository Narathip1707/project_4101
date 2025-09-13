import * as z from "zod";

// Email validation สำหรับ rumail.ru.ac.th
export const emailSchema = z
  .string()
  .min(1, "กรุณากรอกอีเมล")
  .email("รูปแบบอีเมลไม่ถูกต้อง")
  .refine((email) => email.endsWith("@rumail.ru.ac.th"), {
    message: "อีเมลต้องเป็นของมหาวิทยาลัยรามคำแหง (@rumail.ru.ac.th)",
  });

// Password validation
export const passwordSchema = z
  .string()
  .min(1, "กรุณากรอกรหัสผ่าน")
  .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Signup schema
export const signupSchema = z.object({
  fullName: z.string().min(1, "กรุณากรอกชื่อ-นามสกุล"),
  role: z.enum(["student", "advisor"]),
  studentId: z.string().optional(),
  employeeId: z.string().optional(),
  phone: z.string().min(1, "กรุณากรอกเบอร์โทรศัพท์"),
  email: emailSchema,
  password: passwordSchema,
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

// Profile schema
export const profileSchema = z.object({
  fullName: z.string().min(1, "กรุณากรอกชื่อ-นามสกุล"),
  phone: z.string().min(1, "กรุณากรอกเบอร์โทรศัพท์"),
  email: emailSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;