"use client"

import { useEffect, useState, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Clock, CheckCircle } from "lucide-react"
import { addMinutes, differenceInSeconds, format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { examService } from "@/services/exam.service"
import { attemptService } from "@/services/attempt.service"
import { Exam } from "@/types/exam"
import { ExamAttempt, ExamAnswer } from "@/types/attempt"
import Image from "next/image"

interface PageProps {
  // 2. แก้ Type ให้เป็น Promise
  params: Promise<{
    examId: string
  }>
}

export default function ExamRoomPage({ params }: PageProps) {
  const router = useRouter()
  // 3. ใช้ use() เพื่อดึงค่าจาก Promise
  const resolvedParams = use(params)
  const examId = parseInt(resolvedParams.examId)

  const [loading, setLoading] = useState(true)
  const [exam, setExam] = useState<Exam | null>(null)
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null)

  // State เก็บคำตอบ: { question_id: choice_id }
  const [answers, setAnswers] = useState<Record<number, number>>({})

  // Timer State
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Result Dialog State
  const [result, setResult] = useState<{ score: number; max: number } | null>(
    null,
  )

  // เพิ่ม State สำหรับนับจำนวนครั้งที่โกง
  const [cheatCount, setCheatCount] = useState(0)

  // 1. Initial Load: ดึงข้อมูลสอบ และ เริ่ม Start Attempt
  useEffect(() => {
    const initExam = async () => {
      try {
        if (isNaN(examId)) return

        const examData = await examService.getById(examId)
        setExam(examData)

        const attemptData = await attemptService.start(examId)
        setAttempt(attemptData)

        // --- เพิ่มท่อนนี้ครับ ---
        // ถ้าสอบเสร็จไปแล้ว (is_submitted = true) ให้โชว์คะแนนเลย ไม่ต้องจับเวลา
        if (attemptData.is_submitted) {
          setResult({ score: attemptData.score, max: attemptData.max_score })
          setLoading(false)
          return // จบการทำงาน ไม่ต้องไปตั้งเวลาต่อ
        }

        // 1.3 คำนวณเวลาหมด
        // StartTime จาก DB + Duration ของข้อสอบ
        const startTime = new Date(attemptData.start_time)
        const endTime = addMinutes(startTime, examData.duration)

        // เริ่มเดินเวลา
        const updateTimer = () => {
          const now = new Date()
          const diff = differenceInSeconds(endTime, now)
          if (diff <= 0) {
            setTimeLeft(0)
            handleSubmit(true) // หมดเวลา -> ส่งทันที
            if (timerRef.current) clearInterval(timerRef.current)
          } else {
            setTimeLeft(diff)
          }
        }

        updateTimer() // รันครั้งแรกทันที
        timerRef.current = setInterval(updateTimer, 1000) // รันทุกวินาที
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อสอบ")
        router.push("/dashboard/exams") // ดีดกลับถ้ามีปัญหา
      } finally {
        setLoading(false)
      }
    }

    initExam()

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [examId, router])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // ถ้านักเรียนสลับจอ หรือพับหน้าจอ
        setCheatCount((prev) => prev + 1)
        toast.error("คำเตือน! กรุณาอย่าออกจากหน้าสอบ", {
          description: "ระบบได้บันทึกพฤติกรรมของท่านไว้แล้ว",
          duration: 5000,
        })

        // (Optional) ถ้าโกงเกิน 3 ครั้ง อาจจะบังคับส่งข้อสอบเลยก็ได้
        if (cheatCount >= 3) handleSubmit(true)
      }
    }

    // ป้องกันการคลิกขวา (Optional)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    document.addEventListener("contextmenu", handleContextMenu)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [])

  // ฟังก์ชันเลือกคำตอบ
  const handleSelectAnswer = (qId: number, cId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: cId,
    }))
  }

  // ฟังก์ชันส่งข้อสอบ
  const handleSubmit = async (isAuto = false) => {
    if (!attempt || !exam) return

    const answerList: ExamAnswer[] = Object.entries(answers).map(
      ([qId, cId]) => ({
        question_id: parseInt(qId),
        choice_id: cId,
      }),
    )

    try {
      setLoading(true) // เริ่มโหลด
      const res = await attemptService.submit(attempt.ID, answerList)

      if (timerRef.current) clearInterval(timerRef.current)

      if (isAuto) {
        toast.warning("หมดเวลาสอบ! ระบบส่งคำตอบอัตโนมัติ")
      } else {
        toast.success("ส่งข้อสอบเรียบร้อยแล้ว")
      }

      setResult({ score: res.score, max: res.max_score })

      // --- เพิ่มบรรทัดนี้ครับ !!! ---
      setLoading(false) // หยุดโหลด เพื่อให้ UI ไปโชว์หน้า Result
      // --------------------------
    } catch (error) {
      toast.error("ส่งข้อสอบไม่สำเร็จ กรุณาลองใหม่")
      setLoading(false) // ใน catch มีอยู่แล้ว
    }
  }

  // Format เวลาเป็น MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500">กำลังเตรียมห้องสอบ...</p>
      </div>
    )
  }

  // ถ้าส่งแล้ว ให้โชว์ Dialog ผลสอบ
  if (result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <CheckCircle className="h-20 w-20 text-green-500" />
        <h2 className="text-3xl font-bold text-gray-900">การสอบเสร็จสิ้น</h2>
        <Card className="w-full max-w-md text-center p-6">
          <p className="text-gray-500 mb-2">คะแนนของคุณ</p>
          <div className="text-6xl font-bold text-blue-600 mb-4">
            {result.score}{" "}
            <span className="text-2xl text-gray-400">/ {result.max}</span>
          </div>
          <Button
            className="w-full"
            onClick={() => router.push("/dashboard/exams")} // กลับหน้า Dashboard
          >
            กลับสู่หน้าหลัก
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative">
      {/* ฝั่งซ้าย: ข้อสอบ */}
      <div className="flex-1 space-y-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{exam?.title}</h1>
          <p className="text-gray-500">{exam?.description}</p>
        </div>

        {exam?.questions?.map((q, index) => (
          <Card key={q.ID} id={`q-${q.ID}`}>
            <CardHeader>
              <CardTitle className="text-lg flex flex-col gap-3">
                <div className="flex gap-3">
                  <span className="bg-blue-100 text-blue-800 w-8 h-8 flex items-center justify-center rounded-full text-sm shrink-0">
                    {index + 1}
                  </span>
                  <span>{q.content}</span>
                </div>
                {/* แสดงรูปโจทย์ */}
                {q.image_url && (
                  <div className="ml-11 relative h-60 w-full max-w-md rounded-lg overflow-hidden border">
                    <Image
                      src={q.image_url}
                      alt="Question Image"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                // แก้จุดที่ 1: เพิ่ม ?? "" เพื่อกันค่า undefined
                value={answers[q.ID]?.toString() ?? ""}
                onValueChange={(val) => handleSelectAnswer(q.ID, parseInt(val))}
              >
                {q.choices.map((c) => (
                  <div
                    key={c.ID}
                    // แก้จุดที่ 2: เพิ่ม onClick ที่ div ครอบ เพื่อให้คลิกง่ายขึ้น (คลิกตรงไหนในกรอบก็ได้)
                    onClick={() => handleSelectAnswer(q.ID, c.ID!)}
                    className={`flex items-center space-x-2 border p-3 rounded-lg cursor-pointer transition-colors ${
                      // เพิ่มลูกเล่น: ถ้าเลือกข้อนี้อยู่ ให้เปลี่ยนสีพื้นหลังเป็นสีฟ้าอ่อน
                      answers[q.ID] === c.ID
                        ? "bg-blue-50 border-blue-300"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <RadioGroupItem value={c.ID!.toString()} id={`c-${c.ID}`} />
                    <div className="flex-1 cursor-pointer">
                      {/* เพิ่ม cursor-pointer ให้ label ด้วย */}
                      <Label
                        htmlFor={`c-${c.ID}`}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        {c.content}
                      </Label>
                      {/* แสดงรูปตัวเลือก */}
                      {c.image_url && (
                        <div className="mt-2 relative h-32 w-32 rounded-md overflow-hidden border">
                          <Image
                            src={c.image_url}
                            alt="Choice Image"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ฝั่งขวา: แถบเครื่องมือ (Sticky) */}
      <div className="lg:w-72 hidden lg:block">
        <div className="sticky top-6 space-y-4">
          {/* Timer Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center gap-2 text-blue-800 mb-2">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">เวลาที่เหลือ</span>
              </div>
              <div
                className={`text-4xl font-mono font-bold ${timeLeft! < 60 ? "text-red-600 animate-pulse" : "text-gray-800"}`}
              >
                {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
              </div>
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">สถานะการทำ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex justify-between text-xs text-gray-500">
                <span>ทำไปแล้ว {Object.keys(answers).length} ข้อ</span>
                <span>จาก {exam?.questions?.length} ข้อ</span>
              </div>
              <Progress
                value={
                  (Object.keys(answers).length /
                    (exam?.questions?.length || 1)) *
                  100
                }
              />

              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2 mt-4">
                {exam?.questions?.map((q, i) => (
                  <a
                    key={q.ID}
                    href={`#q-${q.ID}`}
                    className={`h-8 w-8 flex items-center justify-center rounded text-xs font-medium transition-colors border
                      ${answers[q.ID] ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 hover:bg-gray-100"}
                    `}
                  >
                    {i + 1}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
            onClick={() => {
              if (
                Object.keys(answers).length < (exam?.questions?.length || 0)
              ) {
                if (!confirm("คุณยังทำข้อสอบไม่ครบ ยืนยันที่จะส่งหรือไม่?"))
                  return
              } else {
                if (!confirm("ยืนยันการส่งข้อสอบ?")) return
              }
              handleSubmit(false)
            }}
          >
            ส่งข้อสอบ
          </Button>
        </div>
      </div>
    </div>
  )
}
