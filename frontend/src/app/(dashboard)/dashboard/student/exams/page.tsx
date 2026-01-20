"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Calendar, Clock, BookOpen, PlayCircle, CheckCircle, AlertCircle, Clock3 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { examService } from "@/services/exam.service";
import { attemptService } from "@/services/attempt.service";
import { Exam } from "@/types/exam";
import { ExamAttempt } from "@/types/attempt";

export default function StudentExamListPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [history, setHistory] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ดึงข้อมูล 2 อย่างพร้อมกัน
        const [examsData, historyData] = await Promise.all([
          examService.getAll(),
          attemptService.getHistory(),
        ]);
        setExams(examsData);
        setHistory(historyData);
      } catch (error) {
        toast.error("ไม่สามารถโหลดข้อมูลการสอบได้");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ฟังก์ชันคำนวณสถานะของแต่ละการสอบ
  const getExamStatus = (exam: Exam) => {
    // 1. เช็คว่าส่งไปแล้วหรือยัง?
    const myAttempt = history.find((h) => h.exam_id === exam.ID && h.is_submitted);
    if (myAttempt) {
      return { status: "submitted", label: "ส่งแล้ว", color: "bg-green-600", canEnter: false };
    }

    // 2. เช็คเวลา
    const now = new Date();
    const start = new Date(exam.start_time);
    const end = new Date(exam.end_time);

    if (now < start) {
      return { status: "upcoming", label: "ยังไม่เริ่ม", color: "bg-yellow-500", canEnter: false };
    } else if (now >= start && now <= end) {
      return { status: "active", label: "เปิดสอบ", color: "bg-blue-600", canEnter: true };
    } else {
      return { status: "expired", label: "หมดเวลา", color: "bg-gray-500", canEnter: false };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          การสอบของฉัน
        </h2>
        <p className="text-gray-500">
          เลือกรายวิชาที่กำลังเปิดสอบเพื่อเข้าทำแบบทดสอบ
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
           <div className="col-span-full text-center py-10">กำลังโหลดรายการสอบ...</div>
        ) : exams.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-lg border border-dashed">
                <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
                <p>ยังไม่มีรายการสอบในขณะนี้</p>
            </div>
        ) : (
            exams.map((exam) => {
                const { status, label, color, canEnter } = getExamStatus(exam);
                
                return (
                  <Card key={exam.ID} className={`flex flex-col hover:shadow-md transition-shadow ${status === 'active' ? 'border-blue-500 border-2' : ''}`}>
                      <CardHeader className="pb-3">
                          <div className="flex justify-between items-start mb-2">
                               <Badge variant="outline" className="font-normal">
                                  {exam.subject?.code}
                               </Badge>
                               <Badge className={color}>
                                  {label}
                               </Badge>
                          </div>
                          <CardTitle className="text-lg leading-tight line-clamp-2">{exam.title}</CardTitle>
                          <CardDescription className="line-clamp-1 mt-1">
                              {exam.subject?.name}
                          </CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm space-y-3 text-gray-600 flex-1">
                          <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <span>
                                  {format(new Date(exam.start_time), "d MMM yy HH:mm", { locale: th })}
                              </span>
                          </div>
                          <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-orange-500" />
                              <span>{exam.duration} นาที</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-purple-500" />
                              <span>{exam.questions?.length || "?"} ข้อ</span>
                          </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        {canEnter ? (
                            <Link href={`/exam-room/${exam.ID}`} className="w-full">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold shadow-blue-200 shadow-lg">
                                    <PlayCircle className="mr-2 h-4 w-4" /> เริ่มทำข้อสอบ
                                </Button>
                            </Link>
                        ) : status === 'submitted' ? (
                            <Button variant="outline" className="w-full text-green-600 border-green-200 bg-green-50" disabled>
                                <CheckCircle className="mr-2 h-4 w-4" /> ส่งคำตอบแล้ว
                            </Button>
                        ) : status === 'upcoming' ? (
                            <Button variant="secondary" className="w-full" disabled>
                                <Clock3 className="mr-2 h-4 w-4" /> รอเวลาเริ่มสอบ
                            </Button>
                        ) : (
                            <Button variant="ghost" className="w-full" disabled>
                                ปิดรับคำตอบแล้ว
                            </Button>
                        )}
                      </CardFooter>
                  </Card>
                );
            })
        )}
      </div>
    </div>
  );
}