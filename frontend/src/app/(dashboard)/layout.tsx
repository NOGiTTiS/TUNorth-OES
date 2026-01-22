"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // เพิ่ม usePathname
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react"; // เพิ่ม Icon โหลด

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  // ดึง state จาก store
  const { isAuthenticated, user, token } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 1. เช็คว่า Login หรือยัง
    // ต้องเช็ค token จาก localStorage ด้วย เพราะบางที state ใน zustand อาจจะยังไม่ restore กลับมาตอน refresh
    const storedToken = localStorage.getItem("token");

    if (!storedToken && !token) {
      router.push("/login");
      return;
    }

    // 2. เช็คสิทธิ์การเข้าถึง (Role Base Access Control)
    if (user) {
      const role = user.role;

      // รายการหน้าที่ห้าม "นักเรียน" เข้า
      const teacherRoutes = [
        "/dashboard/subjects",
        "/dashboard/questions",
        "/dashboard/exams", // หน้านี้รวม create ด้วย
        "/dashboard/students",
      ];
      
      // ถ้านักเรียน พยายามเข้าหน้าครู -> ดีดกลับ Dashboard
      if (role === "student" && teacherRoutes.some(route => pathname.startsWith(route))) {
        // ยกเว้นหน้า /dashboard/student/exams ที่นักเรียนเข้าได้
        if (!pathname.startsWith("/dashboard/student")) {
           router.push("/dashboard");
        }
      }
    }
    
    setIsChecking(false);

  }, [isAuthenticated, token, user, router, pathname]);

  // แสดงหน้าจอ Loading ระหว่างตรวจสอบสิทธิ์ (เพื่อไม่ให้เห็นหน้าจอแวบๆ)
  if (isChecking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}