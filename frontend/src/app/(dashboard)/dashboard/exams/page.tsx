"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Plus, Calendar, Clock, BookOpen, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { examService } from "@/services/exam.service";
import { Exam } from "@/types/exam";
import { toast } from "sonner";

export default function ExamListPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await examService.getAll();
        setExams(data);
      } catch (error) {
        console.error(error);
        toast.error("ไม่สามารถโหลดรายการสอบได้");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  // ฟังก์ชันเช็คสถานะการสอบ
  const getExamStatus = (start: string, end: string) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (now > endDate) {
      return { label: "จบแล้ว", color: "bg-gray-500 hover:bg-gray-600" };
    } else if (now >= startDate && now <= endDate) {
      return {
        label: "กำลังดำเนินการ",
        color: "bg-green-600 hover:bg-green-700",
      };
    } else {
      return { label: "ยังไม่เริ่ม", color: "bg-blue-600 hover:bg-blue-700" };
    }
  };

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
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> สร้างชุดข้อสอบ
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Skeleton Loading (ถ้าอยากทำสวยๆ) หรือ Text ธรรมดา
          <div className="col-span-full text-center py-10">
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
            const status = getExamStatus(exam.start_time, exam.end_time);

            return (
              <Card
                key={exam.ID}
                className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="font-normal">
                      {exam.subject?.code} {exam.subject?.name}
                    </Badge>
                    <Badge className={status.color}>{status.label}</Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {exam.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-1 mt-1">
                    {exam.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-2 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
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
                </CardContent>
                {/* ส่วน Footer ของการ์ด */}
                <div className="p-4 pt-0 mt-auto flex gap-2">
                  {/* ปุ่มเข้าห้องสอบ (สำหรับทดสอบ หรือให้นักเรียนกด) */}
                  <Link href={`/exam-room/${exam.ID}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      เข้าห้องสอบ
                    </Button>
                  </Link>

                  {/* ปุ่มดูผลสอบ (สำหรับครู) - เพิ่มปุ่มนี้ครับ */}
                  <Link
                    href={`/dashboard/exams/${exam.ID}/results`}
                    className="flex-1"
                  >
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      ดูผลสอบ
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
