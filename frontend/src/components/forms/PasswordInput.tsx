"use client";

import { forwardRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
  id?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
  animationClass?: string;
  showToggle?: boolean;
  required?: boolean;
  [key: string]: any;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ 
    id = "password", 
    label = "🔒 รหัสผ่าน", 
    placeholder = "กรุณาใส่รหัสผ่าน",
    error,
    className,
    animationClass = "animate-fadeInRight animate-delay-600",
    showToggle = true,
    required = true,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className={cn("space-y-2 transform transition-all duration-300 hover:scale-101", animationClass)}>
        <Label htmlFor={id} className="font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="relative">
          <Input
            id={id}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            ref={ref}
            className={cn(
              "transition-all duration-300 transform hover:scale-105 focus:scale-105 hover:shadow-md focus:shadow-lg",
              showToggle && "pr-12",
              error && "border-red-500 focus-visible:ring-red-500 animate-pulse",
              className
            )}
            {...props}
          />
          {showToggle && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              <span className="text-sm">
                {showPassword ? "🙈" : "👁️"}
              </span>
            </Button>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-500 animate-fadeInUp">❌ {error}</p>
        )}
        <p className="text-xs text-gray-500">
          รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร
        </p>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;