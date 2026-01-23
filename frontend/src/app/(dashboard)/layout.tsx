"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useAuthStore } from "@/store/useAuthStore"
import { Loader2, Menu } from "lucide-react"
import { jwtDecode } from "jwt-decode"
import { UserInfo } from "@/types/auth"

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, token, setLogin, logout } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  // --- Logic เช็ค Login (เหมือนเดิม ไม่ต้องแก้) ---
  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem("token")
      if (!storedToken) {
        router.push("/login")
        return
      }

      if (storedToken && !user) {
        try {
          const decodedUser = jwtDecode<UserInfo>(storedToken)
          const currentTime = Date.now() / 1000
          if (decodedUser.exp < currentTime) throw new Error("Token expired")
          setLogin(storedToken, decodedUser)
        } catch (error) {
          logout()
          router.push("/login")
          return
        }
      }

      // Check Role logic...
      const currentUserRole =
        user?.role || (storedToken ? jwtDecode<UserInfo>(storedToken).role : "")
      const teacherRoutes = [
        "/dashboard/subjects",
        "/dashboard/questions",
        "/dashboard/exams",
        "/dashboard/students",
      ]
      if (
        currentUserRole === "student" &&
        teacherRoutes.some((route) => pathname.startsWith(route))
      ) {
        if (!pathname.startsWith("/dashboard/student"))
          router.push("/dashboard")
      }

      setIsChecking(false)
    }
    checkAuth()
  }, [pathname, router, setLogin, logout, user])
  // -------------------------------------------

  if (isChecking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{
        background: `linear-gradient(135deg, var(--gradient-start, #f8fafc), var(--gradient-end, #f8fafc))`,
      }}
    >
      {/* 1. Sidebar สำหรับ Desktop */}
      {/* สำคัญ: hidden (ซ่อนในมือถือ) md:block (โชว์ในจอใหญ่) */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white h-full shrink-0">
        <Sidebar className="border-none" />
      </aside>

      {/* พื้นที่เนื้อหาหลัก */}
      <div className="flex flex-1 flex-col overflow-hidden w-full">
        {/* 2. Header สำหรับ Mobile (มีปุ่ม Menu) */}
        <header className="md:hidden flex items-center h-16 px-4 bg-white border-b shrink-0 justify-between">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              {/* เมนูที่เลื่อนออกมา */}
              <SheetContent
                side="left"
                className="p-0 w-64 border-r"
                aria-describedby={undefined}
              >
                <VisuallyHidden.Root>
                  <SheetTitle>Menu</SheetTitle>
                </VisuallyHidden.Root>
                <Sidebar className="border-none h-full" />
              </SheetContent>
            </Sheet>
            <span className="font-bold text-lg text-primary">TUNorth-OES</span>
          </div>

          {/* User Profile เล็กๆ บนมือถือ */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              {user?.username?.substring(0, 2).toUpperCase() || "GU"}
            </div>
          </div>
        </header>

        {/* 3. Header สำหรับ Desktop (ซ่อนในมือถือ) */}
        <header className="hidden md:block shrink-0">
          <Header />
        </header>

        {/* 4. เนื้อหา (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
