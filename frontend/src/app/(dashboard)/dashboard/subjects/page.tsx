"use client";

import { useEffect, useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SubjectDialog } from "@/components/features/subjects/subject-dialog";
import { subjectService } from "@/services/subject.service";
import { Subject } from "@/types/subject";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับ Dialog สร้าง/แก้ไข
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // State สำหรับ Dialog ลบ
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ฟังก์ชันดึงข้อมูล
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectService.getAll();
      setSubjects(data);
    } catch (error) {
      console.error(error);
      toast.error("ไม่สามารถดึงข้อมูลรายวิชาได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // ฟังก์ชันเปิด Dialog สร้างใหม่
  const handleCreate = () => {
    setSelectedSubject(null);
    setDialogOpen(true);
  };

  // ฟังก์ชันเปิด Dialog แก้ไข
  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setDialogOpen(true);
  };

  // ฟังก์ชันลบข้อมูล
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await subjectService.delete(deleteId);
      toast.success("ลบรายวิชาสำเร็จ");
      fetchSubjects(); // โหลดข้อมูลใหม่
    } catch (error) {
      toast.error("ลบรายวิชาไม่สำเร็จ");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            จัดการรายวิชา
          </h2>
          <p className="text-gray-500">
            รายการวิชาทั้งหมดในระบบที่สามารถเปิดสอบได้
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> เพิ่มรายวิชา
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead className="hidden md:table-cell">คำอธิบาย</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  กำลังโหลดข้อมูล...
                </TableCell>
              </TableRow>
            ) : subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                  ยังไม่มีรายวิชาในระบบ
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((subject) => (
                <TableRow key={subject.ID}>
                  <TableCell className="font-medium">{subject.code}</TableCell>
                  <TableCell>{subject.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-gray-500">
                    {subject.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>ตัวเลือก</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(subject)}>
                          <Pencil className="mr-2 h-4 w-4" /> แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteId(subject.ID)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> ลบ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Component Dialog สำหรับสร้าง/แก้ไข */}
      <SubjectDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        subjectToEdit={selectedSubject}
        onSuccess={fetchSubjects}
      />

      {/* Component Alert Dialog สำหรับยืนยันการลบ */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบรายการ?</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบรายวิชานี้ใช่หรือไม่ การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              ลบข้อมูล
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}