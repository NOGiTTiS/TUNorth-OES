"use client";

import { useEffect, useState, useRef, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Clock, CheckCircle, Lock, AlertOctagon } from "lucide-react";
import { addMinutes, differenceInSeconds } from "date-fns";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { examService } from "@/services/exam.service";
import { attemptService } from "@/services/attempt.service";
import { Exam } from "@/types/exam";
import { ExamAttempt, ExamAnswer } from "@/types/attempt";

// Utility: Shuffle
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

interface PageProps {
  params: Promise<{ examId: string }>;
}

export default function ExamRoomPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const examId = parseInt(resolvedParams.examId);

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [result, setResult] = useState<{ score: number; max: number } | null>(null);

  // State ป้องกันการโกง
  const [cheatCount, setCheatCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  // Refs
  const answersRef = useRef<Record<number, number>>({});
  const attemptRef = useRef<ExamAttempt | null>(null);
  const cheatCountRef = useRef(0);

  const STORAGE_KEY_ANSWERS = `exam_${examId}_answers`;
  const STORAGE_KEY_CHEAT = `exam_${examId}_cheat_count`;

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { attemptRef.current = attempt; }, [attempt]);
  useEffect(() => { cheatCountRef.current = cheatCount; }, [cheatCount]);

  const handleSubmit = useCallback(async (isAuto = false) => {
    const currentAttempt = attemptRef.current;
    const currentAnswers = answersRef.current;

    if (!currentAttempt) return;
    
    const answerList: ExamAnswer[] = Object.entries(currentAnswers).map(([qId, cId]) => ({
      question_id: parseInt(qId),
      choice_id: cId,
    }));

    try {
      setLoading(true);
      const res = await attemptService.submit(currentAttempt.ID, answerList);
      
      if (timerRef.current) clearInterval(timerRef.current);

      if (isAuto) {
        if (cheatCountRef.current >= 3) {
            toast.error("ส่งข้อสอบอัตโนมัติเนื่องจากทำผิดกฎการสอบ");
        } else {
            toast.warning("หมดเวลาสอบ ระบบส่งคำตอบอัตโนมัติ");
        }
      } else {
        toast.success("ส่งข้อสอบเรียบร้อยแล้ว");
      }

      setResult({ score: res.score, max: res.max_score });
      
      localStorage.removeItem(STORAGE_KEY_ANSWERS);
      localStorage.removeItem(STORAGE_KEY_CHEAT);

      setLoading(false);
      setShowWarning(false);
      setIsBanned(false);

    } catch (error) {
      toast.error("การส่งข้อสอบขัดข้อง กรุณากดส่งใหม่อีกครั้ง");
      setLoading(false);
    }
  }, [examId, STORAGE_KEY_ANSWERS, STORAGE_KEY_CHEAT]);

  // Initial Load
  useEffect(() => {
    const initExam = async () => {
      try {
        if (isNaN(examId)) return;

        const savedAnswers = localStorage.getItem(STORAGE_KEY_ANSWERS);
        if (savedAnswers) setAnswers(JSON.parse(savedAnswers));

        const savedCheat = localStorage.getItem(STORAGE_KEY_CHEAT);
        if (savedCheat) {
            const count = parseInt(savedCheat);
            setCheatCount(count);
            if (count >= 3) setIsBanned(true);
        }

        const examData = await examService.getById(examId);
        const attemptData = await attemptService.start(examId);

        // Randomize Check
        if (examData.questions && examData.is_random) {
            examData.questions = shuffleArray(examData.questions);
            examData.questions.forEach(q => {
                if (q.choices) q.choices = shuffleArray(q.choices);
            });
        }

        setExam(examData);
        setAttempt(attemptData);

        if (attemptData.is_submitted) {
            setResult({ score: attemptData.score, max: attemptData.max_score });
            setLoading(false);
            return;
        }

        if (cheatCountRef.current >= 3) {
            handleSubmit(true);
            return;
        }

        const startTime = new Date(attemptData.start_time);
        const endTime = addMinutes(startTime, examData.duration);
        
        const updateTimer = () => {
          const now = new Date();
          const diff = differenceInSeconds(endTime, now);
          if (diff <= 0) {
            setTimeLeft(0);
            handleSubmit(true);
            if (timerRef.current) clearInterval(timerRef.current);
          } else {
            setTimeLeft(diff);
          }
        };

        updateTimer();
        timerRef.current = setInterval(updateTimer, 1000);

      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อสอบ");
        router.push("/dashboard/students/exams");
      } finally {
        setLoading(false);
      }
    };

    initExam();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, router]); 

  // Anti-Cheating
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const newCount = cheatCountRef.current + 1;
        setCheatCount(newCount);
        localStorage.setItem(STORAGE_KEY_CHEAT, newCount.toString());

        if (newCount >= 3) {
            setIsBanned(true);
            handleSubmit(true);
        } else {
            setShowWarning(true);
        }
      }
    };

    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", preventDefault);
    document.addEventListener("copy", preventDefault);
    document.addEventListener("cut", preventDefault);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("contextmenu", preventDefault);
      document.removeEventListener("copy", preventDefault);
      document.removeEventListener("cut", preventDefault);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleSubmit, STORAGE_KEY_CHEAT]);

  const handleSelectAnswer = (qId: number, cId: number) => {
    if (isBanned || loading) return;

    setAnswers((prev) => {
        const newAnswers = { ...prev, [qId]: cId };
        localStorage.setItem(STORAGE_KEY_ANSWERS, JSON.stringify(newAnswers));
        return newAnswers;
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500">
            {isBanned ? "กำลังส่งข้อสอบและบันทึกการทุจริต..." : "กำลังประมวลผล..."}
        </p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <CheckCircle className="h-20 w-20 text-green-500" />
        <h2 className="text-3xl font-bold text-gray-900">การสอบเสร็จสิ้น</h2>
        <Card className="w-full max-w-md text-center p-6">
          
          {/* Check Show Score Setting */}
          {result.score !== -1 ? (
              <>
                <p className="text-gray-500 mb-2">คะแนนของคุณ</p>
                <div className="text-6xl font-bold text-blue-600 mb-4">
                    {result.score} <span className="text-2xl text-gray-400">/ {result.max}</span>
                </div>
              </>
          ) : (
              <div className="py-6">
                  <p className="text-lg text-gray-700">ระบบได้รับคำตอบของคุณเรียบร้อยแล้ว</p>
                  <p className="text-sm text-gray-500 mt-2">คะแนนจะประกาศให้ทราบภายหลัง</p>
              </div>
          )}

          {cheatCount > 0 && (
             <div className="text-red-500 text-sm mt-4 bg-red-50 p-2 rounded border border-red-100">
                หมายเหตุ: ตรวจพบการสลับหน้าจอ {cheatCount} ครั้ง
             </div>
          )}
          <Button className="w-full mt-4" onClick={() => router.push("/dashboard/students/exams")}>
            กลับสู่หน้าหลัก
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`flex flex-col lg:flex-row gap-6 relative select-none ${isBanned ? 'pointer-events-none opacity-50' : ''}`}>
      
      <AlertDialog open={showWarning && !isBanned}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <div className="flex flex-col items-center gap-4 mb-4">
                    <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Lock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <AlertDialogTitle className="text-xl text-yellow-700">คำเตือนพฤติกรรม!</AlertDialogTitle>
                </div>
                <AlertDialogDescription className="text-center text-gray-600">
                    ตรวจพบการออกจากหน้าสอบหรือสลับหน้าจอ <br/>
                    <span className="font-bold text-black mt-2 block text-lg">
                        ครั้งที่ {cheatCount} / 3
                    </span>
                    <br/>
                    หากครบ 3 ครั้ง ระบบจะ <span className="text-red-600 font-bold">ปรับตกและส่งข้อสอบทันที</span>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center">
                <AlertDialogAction onClick={() => setShowWarning(false)} className="bg-yellow-600 hover:bg-yellow-700 w-full sm:w-auto px-8">
                    รับทราบและกลับสู่การสอบ
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBanned}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <div className="flex flex-col items-center gap-4 mb-4">
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertOctagon className="h-8 w-8 text-red-600" />
                    </div>
                    <AlertDialogTitle className="text-2xl text-red-600">ยุติการสอบ!</AlertDialogTitle>
                </div>
                <AlertDialogDescription className="text-center text-gray-600">
                    คุณทำผิดกฎการสอบ (สลับหน้าจอเกินกำหนด) <br/>
                    ระบบกำลังบันทึกคำตอบและยุติการสอบของคุณทันที
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center">
                <Button 
                    onClick={() => handleSubmit(true)} 
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 w-full"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                    ยืนยันส่งข้อสอบ
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                 {q.image_url && (
                    <div className="ml-11 relative h-60 w-full max-w-md rounded-lg overflow-hidden border bg-slate-50">
                        <Image 
                            src={q.image_url} 
                            alt="Question Image" 
                            fill 
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 500px"
                        />
                    </div>
                 )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={answers[q.ID]?.toString() ?? ""} 
                onValueChange={(val) => handleSelectAnswer(q.ID, parseInt(val))}
              >
                {q.choices.map((c) => (
                  <div 
                    key={c.ID} 
                    onClick={() => !isBanned && handleSelectAnswer(q.ID, c.ID!)}
                    className={`flex items-start space-x-2 border p-3 rounded-lg transition-colors ${
                      answers[q.ID] === c.ID ? 'bg-blue-50 border-blue-300' : 'hover:bg-slate-50'
                    } ${isBanned ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                  >
                    <RadioGroupItem value={c.ID!.toString()} id={`c-${c.ID}`} className="mt-1" />
                    <div className="flex-1">
                        <Label htmlFor={`c-${c.ID}`} className={`font-normal block leading-relaxed ${isBanned ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                          {c.content}
                        </Label>
                        {c.image_url && (
                            <div className="mt-2 relative h-32 w-32 rounded-md overflow-hidden border">
                                <Image 
                                    src={c.image_url} 
                                    alt="Choice Image" 
                                    fill 
                                    className="object-cover"
                                    sizes="150px"
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

      <div className="lg:w-72 hidden lg:block">
        <div className="sticky top-6 space-y-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center gap-2 text-blue-800 mb-2">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">เวลาที่เหลือ</span>
              </div>
              <div className={`text-4xl font-mono font-bold ${timeLeft! < 60 ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
                {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">สถานะการทำ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex justify-between text-xs text-gray-500">
                <span>ทำไปแล้ว {Object.keys(answers).length} ข้อ</span>
                <span>จาก {exam?.questions?.length} ข้อ</span>
              </div>
              <Progress value={(Object.keys(answers).length / (exam?.questions?.length || 1)) * 100} />
              <div className="grid grid-cols-5 gap-2 mt-4">
                {exam?.questions?.map((q, i) => (
                  <a
                    key={q.ID}
                    href={`#q-${q.ID}`}
                    className={`h-8 w-8 flex items-center justify-center rounded text-xs font-medium transition-colors border
                      ${answers[q.ID] ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-100'}
                    `}
                  >
                    {i + 1}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button 
            className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
            onClick={() => {
                if(!confirm("ยืนยันการส่งข้อสอบ?")) return;
                handleSubmit(false);
            }}
            disabled={loading || isBanned}
          >
            ส่งข้อสอบ
          </Button>
        </div>
      </div>
    </div>
  );
}