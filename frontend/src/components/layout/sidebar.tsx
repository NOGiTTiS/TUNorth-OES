"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  BookOpen,
  Trophy,
  PenTool,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { useRouter } from "next/navigation"

import { useSystemSettings } from "@/hooks/use-system-settings"
import Image from "next/image"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuthStore()
  const { settings } = useSystemSettings()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  // กำหนดเมนูทั้งหมด
  const allMenuItems = [
    {
      title: "แดชบอร์ด",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "teacher", "student"], // เห็นทุกคน
    },
    {
      title: "การสอบของฉัน", // เมนูใหม่
      href: "/dashboard/students/exams",
      icon: PenTool,
      roles: ["student"], // เฉพาะนักเรียน
    },
    {
      title: "จัดการรายวิชา",
      href: "/dashboard/subjects", // แก้ลิงก์ให้ตรงกับไฟล์จริง
      icon: BookOpen,
      roles: ["admin", "teacher"], // นักเรียนห้ามเห็น
    },
    {
      title: "คลังข้อสอบ",
      href: "/dashboard/questions",
      icon: FileText,
      roles: ["admin", "teacher"],
    },
    {
      title: "จัดการการสอบ",
      href: "/dashboard/exams",
      icon: FileText,
      roles: ["admin", "teacher"],
    },
    {
      title: "ประวัติการสอบ",
      href: "/dashboard/history",
      icon: Trophy,
      roles: ["student"], // ครูไม่ต้องดูประวัติตัวเอง (หรือจะดูเพื่อ test ก็ได้)
    },
    {
      title: "จัดการผู้สอบ",
      href: "/dashboard/students",
      icon: Users,
      roles: ["admin"], // แอดมินเท่านั้น
    },
    {
      title: "ตั้งค่าระบบ",
      href: "/settings",
      icon: Settings,
      roles: ["admin"],
    },
  ]

  // กรองเมนูตาม Role
  const menuItems = allMenuItems.filter((item) =>
    item.roles.includes(user?.role || ""),
  )

  return (
    <div
      className={cn("flex h-full w-64 flex-col border-r bg-white", className)}
    >
      <div className="flex h-16 items-center px-6 border-b gap-3">
        {settings?.logo_url && (
          <div className="relative h-8 w-8 shrink-0">
            <Image
              src={settings.logo_url}
              alt="Logo"
              fill
              className="object-contain"
              sizes="32px"
              priority
            />
          </div>
        )}
        <span className="text-lg font-bold text-blue-700 truncate">
          {settings?.system_name || "TUNorth-OES"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t p-4">
        {/* <div className="mb-4 px-2">
          <p className="text-xs text-gray-500">เข้าใช้งานโดย</p>
          <p className="font-medium truncate">{user?.username}</p>
          <p className="text-xs text-blue-600 uppercase">{user?.role}</p>
        </div> */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          ออกจากระบบ
        </button>
      </div>
      {settings?.copyright && (
        <div className="mb-4 px-2 text-xs text-gray-400 text-center">
          {settings.copyright}
        </div>
      )}
    </div>
  )
}
