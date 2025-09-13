"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EmailInputProps {
  id?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
  animationClass?: string;
  required?: boolean;
  [key: string]: any; // สำหรับ props อื่นๆ เช่น register
}

const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  ({ 
    id = "email", 
    label = "📧 อีเมล", 
    placeholder = "กรุณาใส่อีเมล @rumail.ru.ac.th",
    error,
    className,
    animationClass = "animate-fadeInLeft animate-delay-500",
    required = true,
    ...props 
  }, ref) => {
    return (
      <div className={cn("space-y-2 transform transition-all duration-300 hover:scale-101", animationClass)}>
        <Label htmlFor={id} className="font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id={id}
          type="email"
          placeholder={placeholder}
          ref={ref}
          className={cn(
            "transition-all duration-300 transform hover:scale-101 focus:scale-105 hover:shadow-md focus:shadow-lg",
            error && "border-red-500 focus-visible:ring-red-500 animate-pulse",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500 animate-fadeInUp">❌ {error}</p>
        )}
        <p className="text-xs text-gray-500">
          ใช้อีเมลของมหาวิทยาลัยรามคำแหงเท่านั้น (@rumail.ru.ac.th)
        </p>
      </div>
    );
  }
);

EmailInput.displayName = "EmailInput";

export default EmailInput;