"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { formatISO } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

import { subjectService } from "@/services/subject.service";
import { questionService } from "@/services/question.service";
import { examService } from "@/services/exam.service";
import { Subject } from "@/types/subject";
import { Question } from "@/types/question";

const formSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อการสอบ"),
  description: z.string().optional(),
  subject_id: z.string().min(1, "กรุณาเลือกวิชา"),
  duration: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "ระบุเวลาเป็นตัวเลข (นาที)",
  }),
  // แก้ไข 2 บรรทัดนี้ครับ (ลบ object ข้างในออก)
  start_time: z.date(), 
  end_time: z.date(),
  question_ids: z.array(z.number()).min(1, "เลือกข้อสอบอย่างน้อย 1 ข้อ"),
});

export default function CreateExamPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: "60",
      question_ids: [],
    },
  });

  // 1. โหลดรายวิชา
  useEffect(() => {
    const loadSubjects = async () => {
      const data = await subjectService.getAll();
      setSubjects(data);
    };
    loadSubjects();
  }, []);

  // 2. เมื่อเลือกวิชา ให้ไปโหลดข้อสอบมา
  const selectedSubjectId = form.watch("subject_id");
  useEffect(() => {
    if (selectedSubjectId) {
      setLoadingQuestions(true);
      // Reset รายการที่เลือกไว้ก่อนหน้า
      form.setValue("question_ids", []);
      
      questionService.getBySubjectId(parseInt(selectedSubjectId))
        .then((data) => setQuestions(data))
        .catch(() => toast.error("โหลดข้อสอบไม่สำเร็จ"))
        .finally(() => setLoadingQuestions(false));
    } else {
        setQuestions([]);
    }
  }, [selectedSubjectId, form]);

  // 3. บันทึกข้อมูล
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await examService.create({
        ...values,
        description: values.description || "", // <-- เพิ่ม || "" (ถ้าเป็น undefined ให้ส่ง string ว่างไปแทน)
        subject_id: parseInt(values.subject_id),
        duration: parseInt(values.duration),
        start_time: formatISO(values.start_time),
        end_time: formatISO(values.end_time),
      });
      toast.success("สร้างชุดข้อสอบสำเร็จ");
      router.push("/dashboard/exams");
    } catch (error: any) {
      toast.error("บันทึกไม่สำเร็จ", {
        description: error.response?.data?.error,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            สร้างชุดข้อสอบใหม่
          </h2>
          <p className="text-gray-500">กำหนดรายละเอียดและเลือกข้อสอบ</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Section 1: ข้อมูลทั่วไป */}
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
                        <Input placeholder="เช่น สอบกลางภาค 1/2569" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="start_time"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>เริ่มสอบ</FormLabel>
                            <FormControl>
                                <DatePicker date={field.value} setDate={field.onChange} />
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
                                <DatePicker date={field.value} setDate={field.onChange} />
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
                      <FormDescription>เวลาจะนับถอยหลังเมื่อนักเรียนเริ่มทำ</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Section 2: เลือกข้อสอบ */}
            <Card className="flex flex-col h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>เลือกข้อสอบ</CardTitle>
                <div className="text-sm text-gray-500">
                    เลือกแล้ว {form.watch("question_ids")?.length || 0} ข้อ
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                {!selectedSubjectId ? (
                    <div className="flex items-center justify-center h-40 text-gray-400">
                        กรุณาเลือกรายวิชาด้านซ้ายก่อน
                    </div>
                ) : loadingQuestions ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                ) : questions.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-gray-400">
                        ไม่มีข้อสอบในวิชานี้
                    </div>
                ) : (
                    <ScrollArea className="h-[500px] px-6 py-2">
                        <FormField
                            control={form.control}
                            name="question_ids"
                            render={() => (
                                <div className="space-y-4">
                                    {questions.map((q) => (
                                        <FormField
                                            key={q.ID}
                                            control={form.control}
                                            name="question_ids"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem
                                                        key={q.ID}
                                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-slate-50 cursor-pointer"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(q.ID)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...field.value, q.ID])
                                                                        : field.onChange(
                                                                            field.value?.filter(
                                                                                (value) => value !== q.ID
                                                                            )
                                                                        )
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none cursor-pointer" onClick={() => {
                                                             const current = field.value || [];
                                                             const isChecked = current.includes(q.ID);
                                                             if(isChecked) {
                                                                 field.onChange(current.filter((v) => v !== q.ID));
                                                             } else {
                                                                 field.onChange([...current, q.ID]);
                                                             }
                                                        }}>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Badge variant={q.difficulty === 1 ? "secondary" : "default"}>
                                                                    {q.difficulty === 1 ? "ง่าย" : q.difficulty === 2 ? "กลาง" : "ยาก"}
                                                                </Badge>
                                                            </div>
                                                            <p className="font-medium text-sm">
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
                    <p className="text-sm text-red-500 px-6 mt-2">
                        {form.formState.errors.question_ids.message}
                    </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-4 border-t pt-6">
             <Button type="button" variant="outline" onClick={() => router.back()}>
                ยกเลิก
             </Button>
             <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-[150px]">
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                บันทึกชุดข้อสอบ
             </Button>
          </div>

        </form>
      </Form>
    </div>
  );
}