"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { subjectService } from "@/services/subject.service";
import { Subject } from "@/types/subject";

// Schema สำหรับ Validation
const formSchema = z.object({
  code: z.string().min(1, "กรุณากรอกรหัสวิชา"),
  name: z.string().min(1, "กรุณากรอกชื่อวิชา"),
  description: z.string().optional(),
});

interface SubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectToEdit?: Subject | null; // ถ้ามีค่าส่งมา แปลว่าเป็นโหมดแก้ไข
  onSuccess: () => void; // ฟังก์ชันที่จะเรียกเมื่อบันทึกเสร็จ (เช่น ให้โหลดตารางใหม่)
}

export function SubjectDialog({
  open,
  onOpenChange,
  subjectToEdit,
  onSuccess,
}: SubjectDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
    },
  });

  // Reset ฟอร์มเมื่อเปิด dialog หรือเปลี่ยนตัวที่จะแก้ไข
  useEffect(() => {
    if (subjectToEdit) {
      form.reset({
        code: subjectToEdit.code,
        name: subjectToEdit.name,
        description: subjectToEdit.description,
      });
    } else {
      form.reset({
        code: "",
        name: "",
        description: "",
      });
    }
  }, [subjectToEdit, form, open]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (subjectToEdit) {
        // โหมดแก้ไข
        await subjectService.update(subjectToEdit.ID, values);
        toast.success("แก้ไขวิชาสำเร็จ");
      } else {
        // โหมดสร้างใหม่
        await subjectService.create(values);
        toast.success("เพิ่มวิชาสำเร็จ");
      }
      onSuccess();
      onOpenChange(false); // ปิด Dialog
    } catch (error: any) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาด", {
        description: error.response?.data?.error || "ไม่สามารถบันทึกข้อมูลได้",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {subjectToEdit ? "แก้ไขรายวิชา" : "เพิ่มรายวิชาใหม่"}
          </DialogTitle>
          <DialogDescription>
            กรอกข้อมูลรายละเอียดวิชาด้านล่าง
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รหัสวิชา</FormLabel>
                  <FormControl>
                    <Input placeholder="เช่น MAT101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อวิชา</FormLabel>
                  <FormControl>
                    <Input placeholder="เช่น คณิตศาสตร์พื้นฐาน" {...field} />
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
                  <FormLabel>คำอธิบาย (ถ้ามี)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="รายละเอียดวิชา..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                บันทึก
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}