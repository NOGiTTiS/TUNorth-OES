"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { ImageUploader } from "@/components/ui/image-uploader"; // Component อัปโหลดรูป

import { questionService } from "@/services/question.service";
import { Question } from "@/types/question";

// Schema Validation
const formSchema = z.object({
  content: z.string().min(1, "กรุณากรอกโจทย์"),
  image_url: z.string().optional(), // รองรับรูปโจทย์
  difficulty: z.string(),
  choices: z
    .array(
      z.object({
        content: z.string().min(1, "กรุณากรอกตัวเลือก"),
        image_url: z.string().optional(), // รองรับรูปตัวเลือก
        is_correct: z.boolean(),
      })
    )
    .min(2, "ต้องมีอย่างน้อย 2 ตัวเลือก")
    .refine((choices) => choices.some((c) => c.is_correct), {
      message: "ต้องมีข้อที่ถูกต้องอย่างน้อย 1 ข้อ",
    }),
});

interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: number;
  onSuccess: () => void;
  questionToEdit?: Question | null; // รับข้อมูลเดิมมาแก้ไข
}

export function QuestionDialog({
  open,
  onOpenChange,
  subjectId,
  onSuccess,
  questionToEdit,
}: QuestionDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      image_url: "",
      difficulty: "1",
      choices: [
        { content: "", image_url: "", is_correct: false },
        { content: "", image_url: "", is_correct: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "choices",
  });

  // Effect: โหลดข้อมูลเข้าฟอร์มเมื่อเปิด Dialog
  useEffect(() => {
    if (open) {
      if (questionToEdit) {
        // โหมดแก้ไข: เอาข้อมูลเก่ามาใส่
        form.reset({
          content: questionToEdit.content,
          image_url: questionToEdit.image_url || "",
          difficulty: questionToEdit.difficulty.toString(),
          choices: questionToEdit.choices.map((c) => ({
            content: c.content,
            image_url: c.image_url || "",
            is_correct: c.is_correct,
          })),
        });
      } else {
        // โหมดสร้างใหม่: เคลียร์ค่า
        form.reset({
          content: "",
          image_url: "",
          difficulty: "1",
          choices: [
            { content: "", image_url: "", is_correct: false },
            { content: "", image_url: "", is_correct: false },
          ],
        });
      }
    }
  }, [open, questionToEdit, form]);

  const setCorrectChoice = (index: number) => {
    const currentChoices = form.getValues("choices");
    const updatedChoices = currentChoices.map((c, i) => ({
      ...c,
      is_correct: i === index,
    }));
    form.setValue("choices", updatedChoices);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload = {
        subject_id: subjectId,
        content: values.content,
        image_url: values.image_url,
        difficulty: parseInt(values.difficulty),
        choices: values.choices,
      };

      if (questionToEdit) {
        // เรียก Update API
        await questionService.update(questionToEdit.ID, payload);
        toast.success("แก้ไขข้อสอบสำเร็จ");
      } else {
        // เรียก Create API
        await questionService.create(payload);
        toast.success("สร้างข้อสอบสำเร็จ");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("บันทึกไม่สำเร็จ", {
        description: error.response?.data?.error || "เกิดข้อผิดพลาด",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {questionToEdit ? "แก้ไขข้อสอบ" : "เพิ่มข้อสอบใหม่"}
          </DialogTitle>
          <DialogDescription>
            กำหนดรายละเอียดโจทย์ รูปภาพประกอบ และตัวเลือกคำตอบ
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* ส่วนโจทย์ */}
            <div className="space-y-4 border p-4 rounded-md bg-slate-50">
                <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="font-bold text-base">โจทย์คำถาม</FormLabel>
                    <FormControl>
                        <Textarea placeholder="พิมพ์โจทย์ที่นี่..." className="min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>รูปภาพประกอบโจทย์ (ถ้ามี)</FormLabel>
                        <FormControl>
                            <ImageUploader value={field.value} onChange={field.onChange} />
                        </FormControl>
                    </FormItem>
                )}
                />
            </div>

            {/* ความยาก */}
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ระดับความยาก</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            {/* ตัวเลือก */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="font-bold text-base">ตัวเลือกคำตอบ</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ content: "", image_url: "", is_correct: false })}
                >
                  <Plus className="mr-2 h-4 w-4" /> เพิ่มตัวเลือก
                </Button>
              </div>

              {form.formState.errors.choices?.root && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.choices.root.message}
                </p>
              )}

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-4 p-4 border rounded-md">
                  {/* ปุ่มเลือกข้อถูก */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setCorrectChoice(index)}
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        form.watch(`choices.${index}.is_correct`)
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      title="คลิกเพื่อตั้งเป็นคำตอบที่ถูก"
                    >
                      {form.watch(`choices.${index}.is_correct`) && (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex-1 space-y-3">
                      {/* ข้อความตัวเลือก */}
                      <FormField
                        control={form.control}
                        name={`choices.${index}.content`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder={`ตัวเลือกที่ ${index + 1}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* รูปภาพตัวเลือก */}
                      <FormField
                        control={form.control}
                        name={`choices.${index}.image_url`}
                        render={({ field }) => (
                           <FormItem>
                             <FormControl>
                                <ImageUploader 
                                    value={field.value} 
                                    onChange={field.onChange} 
                                    className="scale-90 origin-top-left" // ย่อปุ่มหน่อยจะได้ไม่เกะกะ
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
                    disabled={fields.length <= 2}
                    className="text-red-500 hover:text-red-600 mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/80">
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {questionToEdit ? "บันทึกการแก้ไข" : "บันทึกข้อสอบ"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}