"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // ตรวจสอบว่า Login หรือยัง? ถ้ายัง ให้ดีดกลับไปหน้า Login
  useEffect(() => {
    // เช็คจาก LocalStorage เผื่อ refresh หน้าเว็บ
    const token = localStorage.getItem("token");
    if (!token && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* เมนูซ้าย */}
      <Sidebar />

      {/* พื้นที่เนื้อหาหลัก */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* แถบบน */}
        <Header />

        {/* เนื้อหาหน้า Dashboard (จะเปลี่ยนไปตาม page.tsx) */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}