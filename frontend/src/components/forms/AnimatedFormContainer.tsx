"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnimatedFormContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  animationClass?: string;
}

export default function AnimatedFormContainer({ 
  title, 
  description, 
  children, 
  className,
  animationClass = "animate-scaleIn animate-delay-100"
}: AnimatedFormContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className={cn(
        "w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm transform transition-all duration-500 hover:scale-105 hover:shadow-3xl",
        animationClass,
        className
      )}>
        <CardHeader className="text-center space-y-1 animate-fadeInDown animate-delay-200">
          <CardTitle className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-gray-600 animate-fadeInUp animate-delay-300">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4 animate-fadeInUp animate-delay-400">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}