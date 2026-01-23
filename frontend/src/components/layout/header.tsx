"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // ต้องลง shadcn avatar ก่อน เดี๋ยวพาลงครับ

export function Header() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-white px-6">
      {/* ฝั่งซ้าย (อาจใส่ Breadcrumb ในอนาคต) */}
      <div className="text-sm text-gray-500">
        ยินดีต้อนรับเข้าสู่ระบบจัดการสอบ
      </div>

      {/* ฝั่งขวา (ข้อมูล User) */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {user?.username || "Guest"}
          </div>
          <div className="text-xs text-gray-500 uppercase">
            {user?.role || "Visitor"}
          </div>
        </div>
        
        {/* รูปโปรไฟล์ (ใช้ตัวย่อชื่อไปก่อน) */}
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            {user?.username?.substring(0, 2).toUpperCase() || "GU"}
        </div>
      </div>
    </header>
  );
}