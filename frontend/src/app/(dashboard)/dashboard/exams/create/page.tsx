"use client"

import { useState, useEffect, Suspense } from "react" // เพิ่ม Suspense
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter, useSearchParams } from "next/navigation" // เพิ่ม useSearchParams
import { toast } from "sonner"
import { Loader2, ArrowLeft, Save, CheckSquare, Square } from "lucide-react"
import { formatISO } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

import { subjectService } from "@/services/subject.service"
import { questionService } from "@/services/question.service"
import { examService } from "@/services/exam.service"
import { Subject } from "@/types/subject"
import { Question } from "@/types/question"

// Helper & Schema เหมือนเดิม
const generateClassOptions = () => {
  const options = []
  for (let grade = 4; grade <= 6; grade++) {
    for (let room = 1; room <= 15; room++) {
      options.push(`${grade}.${room}`)
    }
  }
  return options
}

const classOptions = generateClassOptions()

const formSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อการสอบ"),
  description: z.string().optional(),
  subject_id: z.string().min(1, "กรุณาเลือกวิชา"),
  duration: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "ระบุเวลาเป็นตัวเลข (นาที)",
  }),
  start_time: z.date(),
  end_time: z.date(),
  target_classes: z
    .array(z.string())
    .min(1, "กรุณาเลือกห้องเรียนอย่างน้อย 1 ห้อง"),
  question_ids: z.array(z.number()).min(1, "เลือกข้อสอบอย่างน้อย 1 ข้อ"),
  is_random: z.boolean(),
  show_score: z.boolean(),
})

// แยก Content ออกมาเป็น Component เพื่อใส่ Suspense ได้ง่าย
function CreateExamForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit") // ดึง ID จาก URL (?edit=5)

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [loadingData, setLoadingData] = useState(false) // Loading สำหรับดึงข้อมูล Edit

  const [selectedGrade, setSelectedGrade] = useState("4")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: "60",
      target_classes: [],
      question_ids: [],
      is_random: true,
      show_score: true,
    },
  })

  // 1. โหลดรายวิชา
  useEffect(() => {
    const loadSubjects = async () => {
      const data = await subjectService.getAll()
      setSubjects(data)
    }
    loadSubjects()
  }, [])

  // 2. ถ้ามี Edit ID ให้โหลดข้อมูลเดิมมาใส่ฟอร์ม
  useEffect(() => {
    if (!editId) return

    const fetchExamData = async () => {
      setLoadingData(true)
      try {
        const exam = await examService.getById(parseInt(editId))

        // Populate Form
        form.reset({
          title: exam.title,
          description: exam.description,
          subject_id: exam.subject_id.toString(),
          duration: exam.duration.toString(),
          start_time: new Date(exam.start_time),
          end_time: new Date(exam.end_time),
          target_classes: exam.target_classes?.map((c) => c.name) || [],
          // ดึง ID ของคำถามที่มีอยู่แล้ว
          question_ids: exam.questions?.map((q) => q.ID) || [],
          is_random: (exam as any).is_random ?? true,
          show_score: (exam as any).show_score ?? true,
        })
      } catch (error) {
        toast.error("ไม่สามารถโหลดข้อมูลชุดข้อสอบได้")
        router.push("/dashboard/exams")
      } finally {
        setLoadingData(false)
      }
    }

    fetchExamData()
  }, [editId, form, router])

  // 3. โหลดข้อสอบเมื่อเลือกวิชา (Logic เดิม แต่ปรับให้ไม่ Reset ถ้าเป็น Edit Mode รอบแรก)
  const selectedSubjectId = form.watch("subject_id")
  useEffect(() => {
    if (selectedSubjectId) {
      setLoadingQuestions(true)

      questionService
        .getBySubjectId(parseInt(selectedSubjectId))
        .then((data) => {
          setQuestions(data)
          // ถ้าไม่ใช่โหมด Edit (หรือเปลี่ยนวิชาใหม่) ให้เคลียร์ข้อสอบที่เลือก
          // แต่ถ้ากำลังโหลดข้อมูล Edit อยู่ (question_ids มีค่า) อย่าเพิ่งเคลียร์
          const currentIds = form.getValues("question_ids")
          if (!editId && currentIds.length > 0) {
            form.setValue("question_ids", [])
          }
        })
        .catch(() => toast.error("โหลดข้อสอบไม่สำเร็จ"))
        .finally(() => setLoadingQuestions(false))
    } else {
      setQuestions([])
    }
  }, [selectedSubjectId, form, editId])

  // --- Logic เลือกห้อง/เลือกข้อสอบ (เหมือนเดิม) ---
  const filteredClasses = classOptions.filter((cls) =>
    cls.startsWith(`${selectedGrade}.`),
  )

  const toggleSelectVisibleClasses = () => {
    const current = form.getValues("target_classes")
    const isAllVisibleSelected = filteredClasses.every((cls) =>
      current.includes(cls),
    )
    if (isAllVisibleSelected) {
      const newValue = current.filter((cls) => !filteredClasses.includes(cls))
      form.setValue("target_classes", newValue)
    } else {
      const toAdd = filteredClasses.filter((cls) => !current.includes(cls))
      form.setValue("target_classes", [...current, ...toAdd])
    }
  }

  const isAllSelected =
    filteredClasses.length > 0 &&
    filteredClasses.every((cls) => form.watch("target_classes")?.includes(cls))

  const currentQuestionIds = form.watch("question_ids")
  const isAllQuestionsSelected =
    questions.length > 0 &&
    questions.every((q) => currentQuestionIds.includes(q.ID))

  const toggleSelectAllQuestions = () => {
    if (isAllQuestionsSelected) {
      form.setValue("question_ids", [])
    } else {
      const allIds = questions.map((q) => q.ID)
      form.setValue("question_ids", allIds)
    }
  }

  // 4. บันทึกข้อมูล (รองรับทั้ง Create และ Update)
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload = {
        ...values,
        description: values.description || "",
        subject_id: parseInt(values.subject_id),
        duration: parseInt(values.duration),
        start_time: formatISO(values.start_time),
        end_time: formatISO(values.end_time),
        target_classes: values.target_classes,
        is_random: values.is_random,
        show_score: values.show_score,
      }

      if (editId) {
        // Update Mode
        await examService.update(parseInt(editId), payload)
        toast.success("แก้ไขชุดข้อสอบสำเร็จ")
      } else {
        // Create Mode
        await examService.create(payload)
        toast.success("สร้างชุดข้อสอบสำเร็จ")
      }

      router.push("/dashboard/exams")
    } catch (error: any) {
      toast.error("บันทึกไม่สำเร็จ", {
        description: error.response?.data?.error || "เกิดข้อผิดพลาด",
      })
    }
  }

  if (loadingData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-500">กำลังโหลดข้อมูล...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 p-2 md:p-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
            {editId ? "แก้ไขชุดข้อสอบ" : "สร้างชุดข้อสอบใหม่"}
          </h2>
          <p className="text-sm text-gray-500 hidden md:block">
            กำหนดรายละเอียด เลือกห้องเรียน และเลือกข้อสอบ
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* ฝั่งซ้าย: ข้อมูลทั่วไป + ห้องเรียน */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลการสอบ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อการสอบ</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="เช่น สอบกลางภาค 1/2569"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>รายละเอียดเพิ่มเติม</FormLabel>
                        <FormControl>
                          <Textarea placeholder="คำชี้แจงสอบ..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>รายวิชา</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกวิชา" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subjects.map((s) => (
                              <SelectItem key={s.ID} value={s.ID.toString()}>
                                {s.code} - {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>เริ่มสอบ</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={field.value}
                              setDate={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="end_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>สิ้นสุด</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={field.value}
                              setDate={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เวลาทำข้อสอบ (นาที)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col gap-4 p-4 border rounded-md bg-slate-50 mt-4">
                    <h3 className="font-medium text-sm text-gray-700">
                      การตั้งค่าเพิ่มเติม
                    </h3>

                    <FormField
                      control={form.control}
                      name="is_random"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-white">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">
                              สุ่มโจทย์และตัวเลือก
                            </FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="show_score"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-white">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">
                              แสดงคะแนนทันที
                            </FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Section: เลือกห้องเรียน */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle>ห้องเรียนที่มีสิทธิ์สอบ</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectVisibleClasses}
                      className="h-8 text-xs whitespace-nowrap w-full sm:w-auto text-primary hover:text-primary/80 hover:bg-primary/10"
                    >
                      {isAllSelected ? (
                        <>
                          <CheckSquare className="mr-2 h-3 w-3" /> ยกเลิก ม.
                          {selectedGrade} ทั้งหมด
                        </>
                      ) : (
                        <>
                          <Square className="mr-2 h-3 w-3" /> เลือก ม.
                          {selectedGrade} ทั้งหมด
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs
                    defaultValue="4"
                    value={selectedGrade}
                    onValueChange={setSelectedGrade}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="4">ม.4</TabsTrigger>
                      <TabsTrigger value="5">ม.5</TabsTrigger>
                      <TabsTrigger value="6">ม.6</TabsTrigger>
                    </TabsList>

                    <FormField
                      control={form.control}
                      name="target_classes"
                      render={() => (
                        <FormItem>
                          <div className="bg-slate-50 border rounded-md p-2 h-64 overflow-y-auto">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                              {filteredClasses.map((cls) => (
                                <FormField
                                  key={cls}
                                  control={form.control}
                                  name="target_classes"
                                  render={({ field }) => {
                                    const isChecked = field.value?.includes(cls)
                                    return (
                                      <FormItem
                                        key={cls}
                                        className={`flex flex-row items-center space-x-2 space-y-0 p-2 rounded border cursor-pointer transition-all ${isChecked ? "bg-blue-50 border-blue-400" : "bg-white border-gray-200 hover:border-gray-300"}`}
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={isChecked}
                                            onCheckedChange={(checked) =>
                                              checked
                                                ? field.onChange([
                                                    ...field.value,
                                                    cls,
                                                  ])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== cls,
                                                    ),
                                                  )
                                            }
                                          />
                                        </FormControl>
                                        <FormLabel className="font-medium cursor-pointer text-sm w-full pt-0.5">
                                          {cls}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="mt-3 text-xs text-gray-500 text-right">
                      รวมห้องเรียนที่เลือกทั้งหมด:{" "}
                      <span className="font-bold text-primary">
                        {form.watch("target_classes")?.length || 0}
                      </span>{" "}
                      ห้อง
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* ฝั่งขวา: เลือกข้อสอบ */}
            <Card className="flex flex-col h-full min-h-[500px]">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle>เลือกข้อสอบ</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleSelectAllQuestions}
                    disabled={questions.length === 0}
                    className="h-8 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 px-2"
                  >
                    {isAllQuestionsSelected ? (
                      <>
                        <CheckSquare className="mr-1.5 h-3.5 w-3.5" />{" "}
                        ยกเลิกทั้งหมด
                      </>
                    ) : (
                      <>
                        <Square className="mr-1.5 h-3.5 w-3.5" /> เลือกทั้งหมด
                      </>
                    )}
                  </Button>
                  <Badge variant="secondary" className="hidden sm:flex">
                    เลือกแล้ว {form.watch("question_ids")?.length || 0} ข้อ
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 relative">
                {!selectedSubjectId ? (
                  <div className="flex items-center justify-center h-full text-gray-400 absolute inset-0">
                    กรุณาเลือกรายวิชาด้านซ้ายก่อน
                  </div>
                ) : loadingQuestions ? (
                  <div className="flex items-center justify-center h-full absolute inset-0">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : questions.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 absolute inset-0">
                    ไม่มีข้อสอบในวิชานี้
                  </div>
                ) : (
                  <ScrollArea className="h-[600px] px-4 py-2">
                    <FormField
                      control={form.control}
                      name="question_ids"
                      render={() => (
                        <div className="space-y-3 pb-4">
                          {questions.map((q, index) => (
                            <FormField
                              key={q.ID}
                              control={form.control}
                              name="question_ids"
                              render={({ field }) => {
                                const isChecked = field.value?.includes(q.ID)
                                return (
                                  <FormItem
                                    key={q.ID}
                                    className={`flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 cursor-pointer transition-colors ${isChecked ? "bg-blue-50 border-blue-300" : "hover:bg-slate-50"}`}
                                  >
                                    <FormControl>
                                      <Checkbox
                                        className="mt-1"
                                        checked={isChecked}
                                        onCheckedChange={(checked) =>
                                          checked
                                            ? field.onChange([
                                                ...field.value,
                                                q.ID,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== q.ID,
                                                ),
                                              )
                                        }
                                      />
                                    </FormControl>
                                    <div
                                      className="space-y-1 leading-none cursor-pointer w-full"
                                      onClick={() => {
                                        const current = field.value || []
                                        const isChecked = current.includes(q.ID)
                                        field.onChange(
                                          isChecked
                                            ? current.filter((v) => v !== q.ID)
                                            : [...current, q.ID],
                                        )
                                      }}
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-blue-600">
                                          #{index + 1}
                                        </span>
                                        <Badge
                                          variant={
                                            q.difficulty === 1
                                              ? "secondary"
                                              : "outline"
                                          }
                                          className="text-[10px] h-5 px-1.5"
                                        >
                                          {q.difficulty === 1
                                            ? "ง่าย"
                                            : q.difficulty === 2
                                              ? "กลาง"
                                              : "ยาก"}
                                        </Badge>
                                      </div>
                                      <p className="font-medium text-sm line-clamp-2">
                                        {q.content}
                                      </p>
                                    </div>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                      )}
                    />
                  </ScrollArea>
                )}
                {form.formState.errors.question_ids && (
                  <p className="text-sm text-red-500 px-6 mt-2 absolute bottom-2 bg-white w-full text-center p-2 border-t">
                    {form.formState.errors.question_ids.message}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4 border-t pt-6 bg-white sticky bottom-0 z-10 p-4 shadow-top">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/80 min-w-[150px]"
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Save className="mr-2 h-4 w-4" />
              {editId ? "บันทึกการแก้ไข" : "บันทึกชุดข้อสอบ"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

// Main Page Component Wrapper with Suspense
export default function CreateExamPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <CreateExamForm />
    </Suspense>
  )
}
