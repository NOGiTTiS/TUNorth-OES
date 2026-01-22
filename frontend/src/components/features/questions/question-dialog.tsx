"use client"

import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Plus, Trash2, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
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
import { questionService } from "@/services/question.service"
import { ImageUploader } from "@/components/ui/image-uploader"

// Schema Validation
const formSchema = z.object({
  content: z.string().min(1, "กรุณากรอกโจทย์"),
  image_url: z.string().optional(),
  difficulty: z.string(), // รับจาก Select เป็น string แล้วค่อยแปลงเป็น number
  choices: z
    .array(
      z.object({
        content: z.string().min(1, "กรุณากรอกตัวเลือก"),
        image_url: z.string().optional(),
        is_correct: z.boolean(),
      }),
    )
    .min(2, "ต้องมีอย่างน้อย 2 ตัวเลือก")
    .refine((choices) => choices.some((c) => c.is_correct), {
      message: "ต้องมีข้อที่ถูกต้องอย่างน้อย 1 ข้อ",
    }),
})

interface QuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectId: number // รับ ID วิชามา
  onSuccess: () => void
}

export function QuestionDialog({
  open,
  onOpenChange,
  subjectId,
  onSuccess,
}: QuestionDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      difficulty: "1",
      choices: [
        { content: "", is_correct: false },
        { content: "", is_correct: false },
      ], // เริ่มต้นมี 2 ตัวเลือก
    },
  })

  // ใช้ useFieldArray จัดการรายการตัวเลือก (เพิ่ม/ลบ)
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "choices",
  })

  // Reset ฟอร์มเมื่อเปิดใหม่
  useEffect(() => {
    if (open) {
      form.reset({
        content: "",
        difficulty: "1",
        choices: [
          { content: "", is_correct: false },
          { content: "", is_correct: false },
        ],
      })
    }
  }, [open, form])

  // ฟังก์ชันเลือกข้อถูก (ทำให้เลือกได้ทีละข้อเหมือน Radio)
  const setCorrectChoice = (index: number) => {
    const currentChoices = form.getValues("choices")
    const updatedChoices = currentChoices.map((c, i) => ({
      ...c,
      is_correct: i === index, // ตัวที่เลือกเป็น true ที่เหลือ false
    }))
    form.setValue("choices", updatedChoices)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await questionService.create({
        subject_id: subjectId,
        content: values.content,
        image_url: values.image_url,
        difficulty: parseInt(values.difficulty),
        choices: values.choices,
      })
      toast.success("สร้างข้อสอบสำเร็จ")
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error("สร้างข้อสอบไม่สำเร็จ", {
        description: error.response?.data?.error,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>เพิ่มข้อสอบใหม่</DialogTitle>
          <DialogDescription>
            สร้างโจทย์ กำหนดตัวเลือก และเฉลยคำตอบที่ถูกต้อง
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* โจทย์ */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>โจทย์คำถาม</FormLabel>
                  <FormControl>
                    <Textarea placeholder="พิมพ์โจทย์ที่นี่..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* เพิ่ม Uploader ใต้โจทย์ */}
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUploader
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* ระดับความยาก */}
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ระดับความยาก</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกความยาก" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">ง่าย</SelectItem>
                      <SelectItem value="2">ปานกลาง</SelectItem>
                      <SelectItem value="3">ยาก</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ตัวเลือก (Dynamic Choices) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>ตัวเลือกคำตอบ (คลิกวงกลมเพื่อเฉลย)</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ content: "", is_correct: false })}
                >
                  <Plus className="mr-2 h-4 w-4" /> เพิ่มตัวเลือก
                </Button>
              </div>

              {/* Error Message ของ Choices Array (เช่น กรณีไม่มีข้อถูก) */}
              {form.formState.errors.choices?.root && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.choices.root.message}
                </p>
              )}

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3">
                  {/* ปุ่มเลือกข้อถูก */}
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => setCorrectChoice(index)}
                      className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
                        form.watch(`choices.${index}.is_correct`)
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {form.watch(`choices.${index}.is_correct`) && (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                    </button>
                  </div>

                  {/* Input ข้อความตัวเลือก */}
                  <div className="flex-1 space-y-2">
                    <FormField
                      control={form.control}
                      name={`choices.${index}.content`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder={`ตัวเลือกที่ ${index + 1}`}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Uploader ของตัวเลือก */}
                    <FormField
                      control={form.control}
                      name={`choices.${index}.image_url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ImageUploader
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* ปุ่มลบ */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 2} // ห้ามลบถ้าน้อยกว่า 2 ข้อ
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              บันทึกข้อสอบ
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
