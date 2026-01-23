"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import { useSystemSettings } from "@/hooks/use-system-settings" // Import hook
import { useEffect } from "react" // Ensure useEffect is imported

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { authService } from "@/services/auth.service"

// สร้าง Helper สร้างรายการห้อง
const classOptions = []
for (let grade = 4; grade <= 6; grade++) {
  for (let room = 1; room <= 15; room++) {
    classOptions.push(`${grade}.${room}`)
  }
}

const formSchema = z
  .object({
    username: z.string().min(4, "ชื่อผู้ใช้ต้องมีอย่างน้อย 4 ตัวอักษร"),
    password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z.string(),
    first_name: z.string().min(1, "กรุณากรอกชื่อจริง"),
    last_name: z.string().min(1, "กรุณากรอกนามสกุล"),
    role: z.enum(["student", "teacher"]),
    class_room: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  })

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { settings, loading: settingsLoading } = useSystemSettings()

  useEffect(() => {
    if (!settingsLoading && settings && !settings.register_enabled) {
      toast.error("ระบบปิดรับสมัครสมาชิกชั่วคราว")
      router.push("/login")
    }
  }, [settings, settingsLoading, router])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      first_name: "",
      last_name: "",
      role: "student",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      // ส่งข้อมูลไปสมัคร (ตัด confirmPassword ออก)
      const { confirmPassword, ...registerData } = values
      await authService.register(registerData)

      toast.success("สมัครสมาชิกสำเร็จ", {
        description: "กรุณาเข้าสู่ระบบ",
      })
      router.push("/login") // ส่งไปหน้า Login
    } catch (err: any) {
      toast.error("สมัครสมาชิกไม่สำเร็จ", {
        description: err.response?.data?.error || "เกิดข้อผิดพลาด",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex h-screen items-center justify-center"
      style={{
        background: `linear-gradient(135deg, var(--gradient-start, #f8fafc), var(--gradient-end, #f8fafc))`,
      }}
    >
      <Card className="w-[350px] shadow-lg border-t-4 border-t-primary">
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
          <CardTitle className="text-2xl font-bold text-primary">
            {settings?.system_name || "สมัครสมาชิก"}
          </CardTitle>
          <CardDescription>
            {settings?.system_description ||
              "สร้างบัญชีใหม่เพื่อเข้าใช้งานระบบ"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อจริง</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>นามสกุล</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อผู้ใช้</FormLabel>
                    <FormControl>
                      <Input placeholder="student01" {...field} />
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
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ยืนยันรหัสผ่าน</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>สถานะ</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกสถานะ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">
                          นักเรียน (Student)
                        </SelectItem>
                        <SelectItem value="teacher">
                          คุณครู (Teacher)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/80"
                disabled={loading}
              >
                {loading ? "กำลังบันทึก..." : "สมัครสมาชิก"}
              </Button>

              <div className="text-center text-sm text-gray-500 mt-4">
                มีบัญชีอยู่แล้ว?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  เข้าสู่ระบบ
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
