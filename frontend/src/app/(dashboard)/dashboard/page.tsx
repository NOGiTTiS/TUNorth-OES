"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  // 1. วิวนักเรียน
  if (user?.role === "student") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          สวัสดี, {user.username} 👋
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
           <Card className="bg-blue-50 border-blue-200">
              <CardHeader><CardTitle className="text-blue-900">การสอบที่กำลังมาถึง</CardTitle></CardHeader>
              <CardContent>
                 <p className="text-sm text-blue-700">ไม่มีการสอบเร็วๆ นี้</p>
                 {/* อนาคตทำ API ดึง Upcoming Exam มาโชว์ตรงนี้ */}
              </CardContent>
           </Card>
           <Card>
              <CardHeader><CardTitle>ประวัติล่าสุด</CardTitle></CardHeader>
              <CardContent>
                 <p className="text-sm text-gray-500">ดูคะแนนย้อนหลังได้ที่เมนูประวัติ</p>
              </CardContent>
           </Card>
        </div>
      </div>
    );
  }

  // 2. วิวครู/แอดมิน (อันเดิม)
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">
        ภาพรวมระบบ ({user?.role})
      </h2>

      {/* การ์ดแสดงสถิติ (Mock Data) */}
      <div className="grid gap-4 md:grid-cols-3">
        
        {/* Card 1 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              ผู้เข้าสอบทั้งหมด
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20.1% จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              ชุดข้อสอบที่เปิดใช้งาน
            </CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25</div>
            <p className="text-xs text-muted-foreground">
              วิชา คณิตศาสตร์, วิทยาศาสตร์...
            </p>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              ส่งคำตอบแล้ว
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">
              ในรอบการสอบปัจจุบัน
            </p>
          </CardContent>
        </Card>

      </div>
      
      {/* พื้นที่ว่างสำหรับกราฟหรือตารางในอนาคต */}
      <div className="rounded-lg border border-dashed p-8 text-center text-gray-400">
        พื้นที่สำหรับแสดงตารางการสอบ หรือกราฟสถิติ (Phase ถัดไป)
      </div>
    </div>
  );
}