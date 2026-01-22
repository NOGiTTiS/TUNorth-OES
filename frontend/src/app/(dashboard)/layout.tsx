"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2, Menu } from "lucide-react"; // 1. เพิ่ม Icon Menu

// 2. Import Sheet components
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"; // เพื่อซ่อน Title (Accessibility)

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
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
      
      {/* 3. Sidebar สำหรับ Desktop (ซ่อนเมื่อจอเล็กกว่า md) */}
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>

      {/* พื้นที่เนื้อหาหลัก */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* 4. ส่วน Header + Mobile Menu Trigger */}
        <div className="flex flex-col">
            {/* Mobile Header Bar (แสดงเฉพาะมือถือ) */}
            <div className="md:hidden flex items-center p-4 bg-white border-b">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="mr-2">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    {/* เมนูที่เลื่อนออกมาจากซ้าย */}
                    <SheetContent side="left" className="p-0 w-64" aria-describedby={undefined}>
                        {/* Accessibility Fix: ต้องมี Title แม้จะซ่อนก็ตาม */}
                        <VisuallyHidden.Root>
                          <SheetTitle>Menu</SheetTitle>
                        </VisuallyHidden.Root>
                        
                        <Sidebar className="border-none" />
                    </SheetContent>
                </Sheet>
                <span className="font-bold text-lg text-blue-700">TUNorth-OES</span>
            </div>

            {/* Desktop Header เดิม (ซ่อนในมือถือ หรือจะโชว์ก็ได้ แต่ผมแนะนำให้ซ่อนถ้ามันซ้ำซ้อน) */}
            {/* หรือถ้า Header ของคุณมีแค่ User Profile ทางขวา ให้ใช้ร่วมกันได้เลยครับ */}
            <div className="hidden md:block">
               <Header />
            </div>
            
            {/* ถ้าอยากให้ Header (User Profile) แสดงในมือถือด้วย ให้ใช้แบบนี้แทน 2 div ด้านบนครับ: */}
            {/* 
            <header className="flex h-16 items-center gap-4 border-b bg-white px-6">
                <div className="md:hidden">
                    <Sheet>...</Sheet> (โค้ด Sheet ข้างบน)
                </div>
                <div className="flex-1">
                   <Header /> (ต้องไปแก้ Header ให้ตัดคำว่า "ยินดีต้อนรับ..." ออกถ้าจอเล็ก)
                </div>
            </header> 
            */}
        </div>

        {/* เนื้อหาหน้าเว็บ */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}