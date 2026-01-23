"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { toast } from "sonner" // 1. เรียกใช้ toast จาก sonner

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { authService } from "@/services/auth.service"
import { useAuthStore } from "@/store/useAuthStore"
import { UserInfo } from "@/types/auth"
import Link from "next/link"
import { useSystemSettings } from "@/hooks/use-system-settings"
import Image from "next/image"

const formSchema = z.object({
  username: z.string().min(1, { message: "กรุณากรอกชื่อผู้ใช้" }),
  password: z.string().min(1, { message: "กรุณากรอกรหัสผ่าน" }),
})

export default function LoginPage() {
  const router = useRouter()
  const setLogin = useAuthStore((state) => state.setLogin)
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)

    try {
      // 1. ส่งข้อมูลไป Login
      const response = await authService.login(values)

      // 2. ถ้าผ่าน: ถอดรหัส Token และบันทึก
      const decodedUser = jwtDecode<UserInfo>(response.token)
      setLogin(response.token, decodedUser)

      // 3. แจ้งเตือนสำเร็จ
      toast.success("เข้าสู่ระบบสำเร็จ", {
        description: `ยินดีต้อนรับคุณ ${decodedUser.username}`,
      })

      router.push("/dashboard")
    } catch (err: any) {
      // 4. ส่วนสำคัญ: เมื่อเกิด Error (401) โค้ดจะกระโดดมาทำงานตรงนี้
      console.error("Login Error:", err)

      // ดึงข้อความ Error จาก Backend (ถ้ามี)
      const errorMessage =
        err.response?.data?.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"

      // แสดง Toast สีแดงแทนหน้าจอ Error
      toast.error("เข้าสู่ระบบไม่สำเร็จ", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }
  const { settings } = useSystemSettings()

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Card className="w-[350px] shadow-lg border-t-4 border-t-blue-600">
        <CardHeader className="space-y-1 text-center">
          {settings?.logo_url && (
            <div className="flex justify-center mb-4">
              <div className="relative h-16 w-16">
                <Image
                  src={settings.logo_url}
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
          <CardTitle className="text-2xl font-bold text-blue-900">
            {settings?.system_name || "เข้าสู่ระบบ"}
          </CardTitle>
          <CardDescription>
            {settings?.system_description || "TUNorth-OES | ระบบจัดสอบออนไลน์"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อผู้ใช้</FormLabel>
                    <FormControl>
                      <Input placeholder="กรอกชื่อผู้ใช้ของคุณ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รหัสผ่าน</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
              </Button>

              <div className="text-center text-sm text-gray-500 mt-4">
                ยังไม่มีบัญชี?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 hover:underline"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
