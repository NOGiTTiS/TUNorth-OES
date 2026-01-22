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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userService } from "@/services/user.service";
import { User } from "@/types/user";

// Helper สร้างห้องเรียน
const classOptions: string[] = [];
for (let grade = 4; grade <= 6; grade++) {
  for (let room = 1; room <= 15; room++) {
    classOptions.push(`${grade}.${room}`);
  }
}

const formSchema = z.object({
  username: z.string().min(4, "ชื่อผู้ใช้ต้องมีอย่างน้อย 4 ตัวอักษร"),
  password: z.string().optional(), // ตอนแก้เป็น optional
  first_name: z.string().min(1, "กรุณากรอกชื่อจริง"),
  last_name: z.string().min(1, "กรุณากรอกนามสกุล"),
  role: z.enum(["student", "teacher", "admin"]),
  class_room: z.string().optional(),
}).refine((data) => {
    // ถ้า role เป็น student ต้องเลือกห้อง
    if (data.role === "student" && !data.class_room) {
        return false;
    }
    return true;
}, {
    message: "นักเรียนต้องระบุห้องเรียน",
    path: ["class_room"],
});

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit?: User | null;
  onSuccess: () => void;
}

export function UserDialog({ open, onOpenChange, userToEdit, onSuccess }: UserDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      first_name: "",
      last_name: "",
      role: "student",
      class_room: "",
    },
  });

  // Reset Form
  useEffect(() => {
    if (open) {
      if (userToEdit) {
        form.reset({
          username: userToEdit.username,
          password: "", // ไม่เอา password เก่ามาโชว์
          first_name: userToEdit.first_name,
          last_name: userToEdit.last_name,
          role: userToEdit.role,
          class_room: userToEdit.class_room || "",
        });
      } else {
        form.reset({
          username: "",
          password: "",
          first_name: "",
          last_name: "",
          role: "student",
          class_room: "",
        });
      }
    }
  }, [open, userToEdit, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Validation เพิ่มเติม: ถ้าสร้างใหม่ ต้องมี password
    if (!userToEdit && !values.password) {
        form.setError("password", { message: "กรุณากำหนดรหัสผ่าน" });
        return;
    }

    try {
      if (userToEdit) {
        await userService.update(userToEdit.ID, values);
        toast.success("แก้ไขข้อมูลผู้ใช้สำเร็จ");
      } else {
        await userService.create(values as any); // cast any นิดนึงเพราะ password optional
        toast.success("เพิ่มผู้ใช้สำเร็จ");
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{userToEdit ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่"}</DialogTitle>
          <DialogDescription>
            กรอกข้อมูลรายละเอียดผู้ใช้งานด้านล่างเพื่อ{userToEdit ? "บันทึกการแก้ไข" : "สร้างบัญชีใหม่"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อผู้ใช้ (Username)</FormLabel>
                  <FormControl>
                    {/* Username แก้ไม่ได้ถ้าเป็นโหมด Edit เพื่อป้องกันปัญหา */}
                    <Input {...field} disabled={!!userToEdit} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รหัสผ่าน {userToEdit && "(เว้นว่างถ้าไม่เปลี่ยน)"}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>ชื่อจริง</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>นามสกุล</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>สถานะ</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="student">นักเรียน</SelectItem>
                            <SelectItem value="teacher">ครูอาจารย์</SelectItem>
                            <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />

                {/* แสดงเลือกห้องเรียนเฉพาะ Role Student */}
                {form.watch("role") === "student" && (
                    <FormField
                    control={form.control}
                    name="class_room"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>ห้องเรียน</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="เลือกห้อง" /></SelectTrigger></FormControl>
                            <SelectContent className="h-[200px]">
                                {classOptions.map(cls => (
                                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                บันทึกข้อมูล
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}