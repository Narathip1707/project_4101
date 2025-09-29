"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  studentId: string;
  department: string;
  faculty: string;
  phone: string;
  year: string;
}

const profileSchema = z.object({
  fullName: z.string().min(1, "Please enter your full name"),
  email: z.string().min(1, "Please enter email").email("Invalid email format"),
  studentId: z.string().min(1, "Please enter student ID"),
  department: z.string().min(1, "Please enter department"),
  faculty: z.string().min(1, "Please enter faculty"),
  phone: z.string().min(1, "Please enter phone number"),
  year: z.string().min(1, "Please enter year"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      const mockUser = {
        id: "1",
        fullName: "Test User",
        email: "test@email.ru.ac.th",
        studentId: "64114000000",
        department: "Computer Science",
        faculty: "Science",
        phone: "081-234-5678",
        year: "4"
      };
      setUser(mockUser);
      reset(mockUser);
    }
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({ ...user!, ...data });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      setError("root", { message: "Failed to update profile" });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    if (user) {
      reset(user);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      reset(user);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 animate-fadeInUp">
        <Card className="w-full max-w-md animate-scaleIn">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl animate-fadeInDown">🚫 Access Denied</CardTitle>
            <CardDescription className="animate-fadeInUp animate-delay-200">Please login to view your profile</CardDescription>
          </CardHeader>
          <CardContent className="text-center animate-fadeInUp animate-delay-300">
            <Link href="/login">
              <Button className="transition-all duration-300 hover:scale-105 hover:shadow-lg">🔐 Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 animate-fadeInUp">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Card with animation */}
        <Card className="animate-fadeInDown animate-delay-100 transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center animate-scaleIn animate-delay-200">
              👤 User Profile
            </CardTitle>
            <CardDescription className="text-center animate-fadeInUp animate-delay-300">
              Manage your personal information
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Main Profile Card with staggered animation */}
        <Card className="animate-fadeInUp animate-delay-200 transform transition-all duration-500 hover:shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="animate-fadeInLeft animate-delay-300">📋 Personal Information</CardTitle>
              {!isEditing ? (
                <Button 
                  onClick={handleEdit} 
                  variant="outline"
                  className="animate-fadeInRight animate-delay-400 transition-all duration-300 hover:scale-110 hover:shadow-md hover:bg-blue-50"
                >
                  ✏️ Edit
                </Button>
              ) : (
                <div className="space-x-2 animate-fadeInRight animate-delay-300">
                  <Button 
                    onClick={handleCancel} 
                    variant="outline"
                    className="transition-all duration-300 hover:scale-110 hover:shadow-md hover:bg-red-50"
                  >
                    ❌ Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="animate-fadeInUp animate-delay-400">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name - with staggered animation */}
              <div className="space-y-2 animate-fadeInLeft animate-delay-500 transform transition-all duration-300 hover:scale-105">
                <Label htmlFor="fullName" className="font-medium">👤 Full Name</Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  disabled={!isEditing}
                  className={cn(
                    "transition-all duration-300 transform hover:scale-105 focus:scale-105",
                    !isEditing && "bg-gray-50 hover:bg-gray-100",
                    isEditing && "hover:shadow-md focus:shadow-lg",
                    errors.fullName && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                  )}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500 animate-fadeInUp">❌ {errors.fullName.message}</p>
                )}
              </div>

              {/* Email - with staggered animation */}
              <div className="space-y-2 animate-fadeInLeft animate-delay-600 transform transition-all duration-300 hover:scale-105">
                <Label htmlFor="email" className="font-medium">📧 Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  disabled={!isEditing}
                  className={cn(
                    "transition-all duration-300 transform hover:scale-105 focus:scale-105",
                    !isEditing && "bg-gray-50 hover:bg-gray-100",
                    isEditing && "hover:shadow-md focus:shadow-lg",
                    errors.email && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                  )}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 animate-fadeInUp">❌ {errors.email.message}</p>
                )}
              </div>

              {/* Student ID - with staggered animation */}
              <div className="space-y-2 animate-fadeInLeft animate-delay-700 transform transition-all duration-300 hover:scale-105">
                <Label htmlFor="studentId" className="font-medium">🆔 Student ID</Label>
                <Input
                  id="studentId"
                  {...register("studentId")}
                  disabled={!isEditing}
                  className={cn(
                    "transition-all duration-300 transform hover:scale-105 focus:scale-105",
                    !isEditing && "bg-gray-50 hover:bg-gray-100",
                    isEditing && "hover:shadow-md focus:shadow-lg",
                    errors.studentId && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                  )}
                />
                {errors.studentId && (
                  <p className="text-sm text-red-500 animate-fadeInUp">❌ {errors.studentId.message}</p>
                )}
              </div>

              {/* Phone - with staggered animation */}
              <div className="space-y-2 animate-fadeInLeft animate-delay-800 transform transition-all duration-300 hover:scale-105">
                <Label htmlFor="phone" className="font-medium">📱 Phone</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  disabled={!isEditing}
                  className={cn(
                    "transition-all duration-300 transform hover:scale-105 focus:scale-105",
                    !isEditing && "bg-gray-50 hover:bg-gray-100",
                    isEditing && "hover:shadow-md focus:shadow-lg",
                    errors.phone && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                  )}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 animate-fadeInUp">❌ {errors.phone.message}</p>
                )}
              </div>

              {/* Department - with staggered animation */}
              <div className="space-y-2 animate-fadeInLeft animate-delay-900 transform transition-all duration-300 hover:scale-105">
                <Label htmlFor="department" className="font-medium">🏢 Department</Label>
                <Input
                  id="department"
                  {...register("department")}
                  disabled={!isEditing}
                  className={cn(
                    "transition-all duration-300 transform hover:scale-105 focus:scale-105",
                    !isEditing && "bg-gray-50 hover:bg-gray-100",
                    isEditing && "hover:shadow-md focus:shadow-lg",
                    errors.department && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                  )}
                />
                {errors.department && (
                  <p className="text-sm text-red-500 animate-fadeInUp">❌ {errors.department.message}</p>
                )}
              </div>

              {/* Faculty - with staggered animation */}
              <div className="space-y-2 animate-fadeInLeft animate-delay-1000 transform transition-all duration-300 hover:scale-105">
                <Label htmlFor="faculty" className="font-medium">🏛️ Faculty</Label>
                <Input
                  id="faculty"
                  {...register("faculty")}
                  disabled={!isEditing}
                  className={cn(
                    "transition-all duration-300 transform hover:scale-105 focus:scale-105",
                    !isEditing && "bg-gray-50 hover:bg-gray-100",
                    isEditing && "hover:shadow-md focus:shadow-lg",
                    errors.faculty && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                  )}
                />
                {errors.faculty && (
                  <p className="text-sm text-red-500 animate-fadeInUp">❌ {errors.faculty.message}</p>
                )}
              </div>

              {/* Year - with staggered animation */}
              <div className="space-y-2 animate-fadeInLeft animate-delay-1100 transform transition-all duration-300 hover:scale-105">
                <Label htmlFor="year" className="font-medium">📚 Year</Label>
                <Input
                  id="year"
                  {...register("year")}
                  disabled={!isEditing}
                  className={cn(
                    "transition-all duration-300 transform hover:scale-105 focus:scale-105",
                    !isEditing && "bg-gray-50 hover:bg-gray-100",
                    isEditing && "hover:shadow-md focus:shadow-lg",
                    errors.year && "border-red-500 focus-visible:ring-red-500 animate-pulse"
                  )}
                />
                {errors.year && (
                  <p className="text-sm text-red-500 animate-fadeInUp">❌ {errors.year.message}</p>
                )}
              </div>
              {/* Error Message with animation */}
              {errors.root && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 animate-fadeInUp animate-delay-300">
                  <p className="text-sm text-red-600 animate-pulse">❌ {errors.root.message}</p>
                </div>
              )}

              {/* Submit Button with enhanced animations */}
              {isEditing && (
                <Button 
                  type="submit" 
                  className="w-full animate-slideInFromBottom animate-delay-1200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="animate-pulse">Saving...</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center space-x-2 animate-bounce">
                      <span>💾</span>
                      <span>Save Changes</span>
                    </span>
                  )}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Action Buttons Card with enhanced animations */}
        <Card className="animate-slideInFromBottom animate-delay-400 transform transition-all duration-500 hover:shadow-xl hover:scale-105">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/">
                <Button 
                  variant="outline" 
                  className="w-full animate-fadeInLeft animate-delay-500 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:bg-blue-50"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span className="animate-bounce">🏠</span>
                    <span>Back to Home</span>
                  </span>
                </Button>
              </Link>
              <Button 
                variant="destructive" 
                className="w-full animate-fadeInRight animate-delay-600 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
              >
                <span className="flex items-center justify-center space-x-2">
                  <span className="animate-pulse">🚪</span>
                  <span>Logout</span>
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
