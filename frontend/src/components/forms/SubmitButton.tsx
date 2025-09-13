"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubmitButtonProps {
  isSubmitting: boolean;
  children: React.ReactNode;
  className?: string;
  animationClass?: string;
  loadingText?: string;
}

export default function SubmitButton({ 
  isSubmitting, 
  children, 
  className,
  animationClass = "animate-fadeInUp animate-delay-1200",
  loadingText = "กำลังดำเนินการ..."
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className={cn(
        "w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        animationClass,
        className
      )}
    >
      {isSubmitting ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
}