"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, Download, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; // อย่าลืมใส่ DialogDescription เพื่อแก้ warning
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { userService } from "@/services/user.service";

interface UserImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UserImportDialog({ open, onOpenChange, onSuccess }: UserImportDialogProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const template = [
      {
        "Username": "student67001",
        "Password": "password123",
        "First Name": "สมชาย",
        "Last Name": "ใจดี",
        "Role (student/teacher)": "student",
        "Class Room": "4.1"
      },
      {
        "Username": "teacher01",
        "Password": "adminpassword",
        "First Name": "คุณครู",
        "Last Name": "สอนดี",
        "Role (student/teacher)": "teacher",
        "Class Room": ""
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "user_import_template.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws);
      
      const parsedUsers = jsonData.map((row: any) => ({
         username: String(row["Username"] || ""),
         password: String(row["Password"] || "123456"), // Default password
         first_name: String(row["First Name"] || ""),
         last_name: String(row["Last Name"] || ""),
         role: String(row["Role (student/teacher)"] || "student").toLowerCase(),
         class_room: String(row["Class Room"] || "")
      }));

      // กรองแถวว่าง
      const validUsers = parsedUsers.filter(u => u.username && u.first_name);
      setData(validUsers);
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (data.length === 0) return;
    setLoading(true);
    try {
      await userService.createBulk(data);
      toast.success(`นำเข้าผู้ใช้งาน ${data.length} คน สำเร็จ`);
      onSuccess();
      onOpenChange(false);
      setData([]);
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาด (Username อาจซ้ำ)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>นำเข้าผู้ใช้งานจาก Excel</DialogTitle>
          <DialogDescription>
            ดาวน์โหลด Template กรอกข้อมูล แล้วอัปโหลดกลับเข้ามา
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-green-600" />
                    <div>
                        <p className="font-medium">1. ดาวน์โหลดไฟล์ต้นแบบ</p>
                        <p className="text-sm text-gray-500">ไฟล์ .xlsx สำหรับกรอกข้อมูล</p>
                    </div>
                </div>
                <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="mr-2 h-4 w-4" /> ดาวน์โหลด Template
                </Button>
            </div>

             <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                <div className="flex items-center gap-3">
                    <Upload className="h-8 w-8 text-blue-600" />
                    <div>
                        <p className="font-medium">2. อัปโหลดไฟล์ที่กรอกแล้ว</p>
                        <p className="text-sm text-gray-500">รองรับไฟล์ .xlsx</p>
                    </div>
                </div>
                <div>
                    <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <Button onClick={() => fileInputRef.current?.click()}>
                        เลือกไฟล์...
                    </Button>
                </div>
            </div>

            {data.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                    <div className="bg-slate-100 p-2 text-sm font-medium border-b flex justify-between items-center">
                        <span>ตัวอย่างข้อมูล ({data.length} คน)</span>
                        <Button variant="ghost" size="sm" onClick={() => setData([])} className="text-red-500 h-auto p-1">
                            ล้างข้อมูล
                        </Button>
                    </div>
                    <div className="max-h-[300px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Username</TableHead>
                                    <TableHead>ชื่อ-นามสกุล</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>ห้อง</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((u, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">{u.username}</TableCell>
                                        <TableCell>{u.first_name} {u.last_name}</TableCell>
                                        <TableCell>{u.role}</TableCell>
                                        <TableCell>{u.class_room}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {data.length === 0 && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>คำแนะนำ</AlertTitle>
                    <AlertDescription>
                        หากไม่ระบุ Password ระบบจะตั้งค่าเริ่มต้นเป็น "123456"
                    </AlertDescription>
                </Alert>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>ยกเลิก</Button>
          <Button onClick={handleImport} disabled={data.length === 0 || loading} className="bg-green-600 hover:bg-green-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
            นำเข้าข้อมูล
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}