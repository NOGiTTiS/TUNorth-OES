"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner"; // 1. เรียกใช้ toast จาก sonner

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import { UserInfo } from "@/types/auth";

const formSchema = z.object({
  username: z.string().min(1, { message: "กรุณากรอกชื่อผู้ใช้" }),
  password: z.string().min(1, { message: "กรุณากรอกรหัสผ่าน" }),
});

export default function LoginPage() {
  const router = useRouter();
  const setLogin = useAuthStore((state) => state.setLogin);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      const response = await authService.login(values);
      const decodedUser = jwtDecode<UserInfo>(response.token);
      
      setLogin(response.token, decodedUser);

      // 2. ใช้ Toast แจ้งเตือนความสำเร็จ
      toast.success("เข้าสู่ระบบสำเร็จ", {
        description: `ยินดีต้อนรับคุณ ${decodedUser.username}`,
      });

      router.push("/dashboard"); 

    } catch (err: any) {
      console.error("Login Failed:", err);
      
      // 3. ใช้ Toast แจ้งเตือน Error
      const errorMessage = err.response?.data?.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
      toast.error("เข้าสู่ระบบไม่สำเร็จ", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Card className="w-[350px] shadow-lg border-t-4 border-t-blue-600"> 
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-blue-900">เข้าสู่ระบบ</CardTitle>
          <CardDescription>
            TUNorth-OES | ระบบจัดสอบออนไลน์
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
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}