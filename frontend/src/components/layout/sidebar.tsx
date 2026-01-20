"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, LogOut, BookOpen } from "lucide-react"; // ไอคอน
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname(); // เอาไว้เช็คว่าอยู่หน้าไหน จะได้ทำสีปุ่ม active ถูก
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // รายการเมนู
  const menuItems = [
    {
      title: "แดชบอร์ด",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "จัดการการสอบ", // เพิ่มเมนูนี้
      href: "/dashboard/exams",
      icon: FileText,
    },
    {
      title: "คลังข้อสอบ",
      href: "/dashboard/questions",
      icon: BookOpen, // เปลี่ยน icon นิดหน่อย
    },
    {
      title: "จัดการผู้สอบ", // (ยังไม่ได้ทำ)
      href: "/dashboard/students",
      icon: Users,
    },
];

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      {/* โลโก้ */}
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-xl font-bold text-blue-700">TUNorth-OES</span>
      </div>

      {/* เมนู */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-blue-50 text-blue-700" // ถ้าอยู่หน้านี้ ให้เป็นสีฟ้า
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>

      {/* ปุ่มออกจากระบบ */}
      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}