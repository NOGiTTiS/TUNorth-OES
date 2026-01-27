"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, CheckCircle, Loader2 } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { dashboardService } from "@/services/dashboard.service"
import { examService } from "@/services/exam.service"
import { attemptService } from "@/services/attempt.service"
import { DashboardStats } from "@/types/dashboard"
import { Exam } from "@/types/exam"
import { ExamAttempt } from "@/types/attempt"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import Link from "next/link" // Import Link component

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(true)

  // Admin Stats
  const [stats, setStats] = useState<DashboardStats | null>(null)

  // Student Data
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([])
  const [recentAttempts, setRecentAttempts] = useState<ExamAttempt[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        if (user?.role === "student") {
          // Fetch Student Data
          const exams = await examService.getAll()
          // Filter incoming exams (start_time > now)
          const now = new Date()
          const upcoming = exams.filter((e) => new Date(e.end_time) > now) // Only show not ended
          setUpcomingExams(upcoming)

          const history = await attemptService.getHistory()
          setRecentAttempts(history.slice(0, 5)) // Show last 5
        } else {
          // Fetch Admin/Teacher Data
          const data = await dashboardService.getStats()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // 1. วิวนักเรียน
  if (user?.role === "student") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          สวัสดี, {user.username} 👋
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* การ์ดการสอบที่กำลังมาถึง */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">
                การสอบที่กำลังมาถึง
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingExams.length === 0 ? (
                <p className="text-sm text-blue-700">ไม่มีการสอบเร็วๆ นี้</p>
              ) : (
                <ul className="space-y-2">
                  {upcomingExams.map((exam) => (
                    <li
                      key={exam.ID}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="font-medium text-blue-900">
                        {exam.title}
                      </span>
                      <span className="text-blue-700 text-xs">
                        {format(new Date(exam.start_time), "d MMM HH:mm", {
                          locale: th,
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* การ์ดประวัติล่าสุด */}
          <Card>
            <CardHeader>
              <CardTitle>ประวัติล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              {recentAttempts.length === 0 ? (
                <p className="text-sm text-gray-500">
                  ดูคะแนนย้อนหลังได้ที่เมนูประวัติ
                </p>
              ) : (
                <ul className="space-y-2">
                  {recentAttempts.map((attempt) => (
                    <li
                      key={attempt.ID}
                      className="flex justify-between items-center text-sm border-b pb-1 last:border-0"
                    >
                      <span className="font-medium">
                        {attempt.exam?.title || "แบบทดสอบ"}
                      </span>
                      {attempt.is_submitted ? (
                        <span className="font-bold text-green-600">
                          {attempt.score} คะแนน
                        </span>
                      ) : (
                        <span className="text-yellow-600 text-xs">กำลังทำ</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {/* ปุ่มดูทั้งหมด */}
              <div className="mt-4 text-right">
                <Link
                  href="/dashboard/history"
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  ดูประวัติทั้งหมด &rarr;
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // 2. วิวครู/แอดมิน (Real Data)
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">
        ภาพรวมระบบ ({user?.role})
      </h2>

      {/* การ์ดแสดงสถิติ */}
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
            <div className="text-2xl font-bold">
              {stats?.total_students || 0}
            </div>
            <p className="text-xs text-muted-foreground">คน</p>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              ชุดข้อสอบ (Active)
            </CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_exams || 0}</div>
            <p className="text-xs text-muted-foreground">ชุด</p>
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
            <div className="text-2xl font-bold">
              {stats?.submitted_answers || 0}
            </div>
            <p className="text-xs text-muted-foreground">ครั้ง</p>
          </CardContent>
        </Card>
      </div>

      {/* พื้นที่ว่างสำหรับกราฟหรือตารางในอนาคต */}
      <div className="rounded-lg border border-dashed p-8 text-center text-gray-400">
        พื้นที่สำหรับแสดงตารางการสอบ หรือกราฟสถิติ (Phase ถัดไป)
      </div>
    </div>
  )
}
