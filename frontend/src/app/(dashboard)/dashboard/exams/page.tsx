"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import {
  Plus,
  Calendar,
  Clock,
  BookOpen,
  AlertCircle,
  Pencil,
  Trash2,
  Users,
  MoreVertical,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { examService } from "@/services/exam.service"
import { Exam } from "@/types/exam"

export default function ExamListPage() {
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetchExams = async () => {
    try {
      const data = await examService.getAll()
      setExams(data)
    } catch (error) {
      console.error(error)
      toast.error("ไม่สามารถโหลดรายการสอบได้")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExams()
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await examService.delete(deleteId)
      toast.success("ลบชุดข้อสอบสำเร็จ")
      fetchExams() // โหลดข้อมูลใหม่
    } catch (error) {
      toast.error("ลบไม่สำเร็จ (อาจมีผู้ทำข้อสอบไปแล้ว)")
    } finally {
      setDeleteId(null)
    }
  }

  const getExamStatus = (start: string, end: string) => {
    const now = new Date()
    const startDate = new Date(start)
    const endDate = new Date(end)

    if (now > endDate) {
      return { label: "จบแล้ว", color: "bg-gray-500 hover:bg-gray-600" }
    } else if (now >= startDate && now <= endDate) {
      return {
        label: "กำลังดำเนินการ",
        color: "bg-green-600 hover:bg-green-700",
      }
    } else {
      return { label: "ยังไม่เริ่ม", color: "bg-primary hover:bg-primary/90" }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            จัดการการสอบ
          </h2>
          <p className="text-gray-500">สร้างและจัดการชุดข้อสอบสำหรับนักเรียน</p>
        </div>
        <Link href="/dashboard/exams/create">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> สร้างชุดข้อสอบ
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            กำลังโหลดข้อมูล...
          </div>
        ) : exams.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-lg border border-dashed">
            <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
            <p>ยังไม่มีการสอบที่สร้างไว้</p>
            <Link href="/dashboard/exams/create" className="mt-4">
              <Button variant="outline">สร้างชุดข้อสอบแรกเลย!</Button>
            </Link>
          </div>
        ) : (
          exams.map((exam) => {
            const status = getExamStatus(exam.start_time, exam.end_time)

            return (
              <Card
                key={exam.ID}
                className="flex flex-col hover:shadow-md transition-shadow relative group"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2 pr-6">
                    <div className="flex flex-col gap-1">
                      <Badge variant="secondary" className="font-normal w-fit">
                        {exam.subject?.code} {exam.subject?.name}
                      </Badge>
                      <Badge className={`${status.color} w-fit`}>
                        {status.label}
                      </Badge>
                    </div>

                    {/* เมนูจัดการ (Edit/Delete) มุมขวาบน */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* ลิงก์ไปหน้า Edit (ถ้าทำแล้ว) หรือ Reuse หน้า Create */}
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboard/exams/create?edit=${exam.ID}`,
                              )
                            }
                          >
                            <Pencil className="mr-2 h-4 w-4" /> แก้ไข
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(exam.ID)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> ลบ
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <CardTitle
                    className="text-lg leading-tight line-clamp-2"
                    title={exam.title}
                  >
                    {exam.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-1 mt-1">
                    {exam.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-sm space-y-3 text-gray-600 flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>
                      {format(new Date(exam.start_time), "d MMM yy HH:mm", {
                        locale: th,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>{exam.duration} นาที</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-purple-500" />
                    <span>ข้อสอบ {exam.questions?.length || 0} ข้อ</span>
                  </div>

                  {/* แสดงห้องเรียน */}
                  <div className="flex items-start gap-2 pt-1 border-t">
                    <Users className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {(exam as any).target_classes &&
                      (exam as any).target_classes.length > 0 ? (
                        (exam as any).target_classes
                          .slice(0, 3)
                          .map((cls: string) => (
                            <span
                              key={cls}
                              className="bg-slate-100 text-slate-600 px-1.5 rounded text-xs"
                            >
                              {cls}
                            </span>
                          ))
                      ) : (
                        <span className="text-xs text-gray-400">
                          ไม่ระบุห้อง
                        </span>
                      )}
                      {(exam as any).target_classes?.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{(exam as any).target_classes.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>

                {/* Action Buttons */}
                <div className="p-4 pt-0 mt-auto flex gap-2">
                  <Link href={`/exam-room/${exam.ID}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      ทดสอบทำ
                    </Button>
                  </Link>
                  <Link
                    href={`/dashboard/exams/${exam.ID}/results`}
                    className="flex-1"
                  >
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      ดูผลสอบ
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Alert Dialog สำหรับยืนยันการลบ */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบชุดข้อสอบ?</AlertDialogTitle>
            <AlertDialogDescription>
              การกระทำนี้ไม่สามารถย้อนกลับได้ หากมีนักเรียนทำข้อสอบชุดนี้ไปแล้ว
              ข้อมูลการสอบและคะแนนจะถูกลบไปด้วย
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              ยืนยันลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
