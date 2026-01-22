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
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { questionService } from "@/services/question.service";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: number;
  onSuccess: () => void;
}

export function ImportDialog({ open, onOpenChange, subjectId, onSuccess }: ImportDialogProps) {
  const [data, setData] = useState<any[]>([]); // ข้อมูลที่อ่านได้
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ฟังก์ชันดาวน์โหลด Template
  const downloadTemplate = () => {
    // สร้างข้อมูลตัวอย่าง
    const template = [
      {
        "โจทย์ (Content)": "1 + 1 เท่ากับเท่าไหร่?",
        "ความยาก (1-3)": 1,
        "รูปภาพ (URL)": "",
        "ตัวเลือก 1": "1",
        "ตัวเลือก 2": "2",
        "ตัวเลือก 3": "3",
        "ตัวเลือก 4": "4",
        "ข้อที่ถูก (1-4)": 2
      },
      {
        "โจทย์ (Content)": "พระอาทิตย์ขึ้นทิศใด?",
        "ความยาก (1-3)": 1,
        "รูปภาพ (URL)": "",
        "ตัวเลือก 1": "ทิศเหนือ",
        "ตัวเลือก 2": "ทิศใต้",
        "ตัวเลือก 3": "ทิศตะวันออก",
        "ตัวเลือก 4": "ทิศตะวันตก",
        "ข้อที่ถูก (1-4)": 3
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "question_template.xlsx");
  };

  // ฟังก์ชันอ่านไฟล์ Excel
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
      
      // แปลงข้อมูล Excel ให้เป็น Format ที่เราต้องการ
      const parsedQuestions = jsonData.map((row: any) => {
         // Logic การแปลงข้อมูลจาก Column Excel มาเป็น Object
         // ต้องตรงกับหัวตารางใน Template
         const choices = [];
         if(row["ตัวเลือก 1"]) choices.push({ content: String(row["ตัวเลือก 1"]), is_correct: row["ข้อที่ถูก (1-4)"] == 1 });
         if(row["ตัวเลือก 2"]) choices.push({ content: String(row["ตัวเลือก 2"]), is_correct: row["ข้อที่ถูก (1-4)"] == 2 });
         if(row["ตัวเลือก 3"]) choices.push({ content: String(row["ตัวเลือก 3"]), is_correct: row["ข้อที่ถูก (1-4)"] == 3 });
         if(row["ตัวเลือก 4"]) choices.push({ content: String(row["ตัวเลือก 4"]), is_correct: row["ข้อที่ถูก (1-4)"] == 4 });

         return {
             content: String(row["โจทย์ (Content)"] || ""),
             difficulty: Number(row["ความยาก (1-3)"]) || 1,
             image_url: String(row["รูปภาพ (URL)"] || ""),
             choices: choices
         };
      });

      setData(parsedQuestions);
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (data.length === 0) return;
    setLoading(true);
    try {
      await questionService.createBulk(subjectId, data);
      toast.success(`นำเข้าข้อสอบ ${data.length} ข้อ สำเร็จ`);
      onSuccess();
      onOpenChange(false);
      setData([]);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการนำเข้า");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>นำเข้าข้อสอบจาก Excel</DialogTitle>
          <DialogDescription>
            ดาวน์โหลด Template, กรอกข้อมูล, แล้วอัปโหลดไฟล์กลับเข้ามา
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
            {/* Step 1: Download Template */}
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

             {/* Step 2: Upload */}
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

            {/* Preview Data */}
            {data.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                    <div className="bg-slate-100 p-2 text-sm font-medium border-b flex justify-between items-center">
                        <span>ตัวอย่างข้อมูล ({data.length} ข้อ)</span>
                        <Button variant="ghost" size="sm" onClick={() => setData([])} className="text-red-500 h-auto p-1">
                            ล้างข้อมูล
                        </Button>
                    </div>
                    <div className="max-h-[300px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>โจทย์</TableHead>
                                    <TableHead>ความยาก</TableHead>
                                    <TableHead>ตัวเลือก</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((q, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">{q.content}</TableCell>
                                        <TableCell>{q.difficulty}</TableCell>
                                        <TableCell className="text-xs text-gray-500">
                                            {q.choices.length} ตัวเลือก 
                                            (ถูก: {q.choices.findIndex((c: any) => c.is_correct) + 1})
                                        </TableCell>
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
                        กรุณากรอกข้อมูลในไฟล์ Excel ให้ครบถ้วน โดยเฉพาะช่อง "ข้อที่ถูก" ให้ใส่เป็นตัวเลข 1, 2, 3 หรือ 4
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