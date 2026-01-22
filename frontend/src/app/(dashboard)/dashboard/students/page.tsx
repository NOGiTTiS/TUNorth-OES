"use client";

import { useEffect, useState } from "react";
import { Trash2, User as UserIcon, Shield, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { th } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

import { userService } from "@/services/user.service";
import { User } from "@/types/user";
import { useAuthStore } from "@/store/useAuthStore";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const currentUser = useAuthStore((state) => state.user);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      toast.error("ไม่สามารถโหลดรายชื่อผู้ใช้ได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await userService.delete(deleteId);
      toast.success("ลบผู้ใช้งานสำเร็จ");
      fetchUsers(); // โหลดข้อมูลใหม่
    } catch (error) {
      toast.error("ลบผู้ใช้งานไม่สำเร็จ");
    } finally {
      setDeleteId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-600"><Shield className="w-3 h-3 mr-1"/> Admin</Badge>;
      case "teacher":
        return <Badge className="bg-blue-600"><UserIcon className="w-3 h-3 mr-1"/> Teacher</Badge>;
      default:
        return <Badge variant="secondary"><GraduationCap className="w-3 h-3 mr-1"/> Student</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          จัดการผู้ใช้งาน
        </h2>
        <p className="text-gray-500">
          รายชื่อนักเรียนและบุคลากรทั้งหมดในระบบ
        </p>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>ชื่อ-นามสกุล</TableHead>
              <TableHead>สถานะ (Role)</TableHead>
              <TableHead>วันที่สมัคร</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  กำลังโหลดข้อมูล...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  ไม่พบผู้ใช้งาน
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.ID}>
                  <TableCell>{u.ID}</TableCell>
                  <TableCell className="font-medium">{u.username}</TableCell>
                  <TableCell>
                    {u.first_name} {u.last_name}
                  </TableCell>
                  <TableCell>{getRoleBadge(u.role)}</TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {u.created_at ? format(new Date(u.created_at), "d MMM yyyy", { locale: th }) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteId(u.ID)}
                      disabled={u.ID === currentUser?.user_id} // ห้ามลบตัวเอง
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบผู้ใช้งาน?</AlertDialogTitle>
            <AlertDialogDescription>
              การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลการสอบและคะแนนทั้งหมดของผู้ใช้นี้จะถูกลบไปด้วย
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              ลบผู้ใช้งาน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}