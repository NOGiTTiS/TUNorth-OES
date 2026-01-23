"use client";

import { useEffect, useState, use } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Download, FileSpreadsheet } from "lucide-react"; // เพิ่ม Icon
import * as XLSX from "xlsx"; // เพิ่ม Library Excel

import { attemptService } from "@/services/attempt.service";
import { ExamAttempt } from "@/types/attempt";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // เพิ่ม Button

export default function ExamResultsPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = use(params);
  const [results, setResults] = useState<ExamAttempt[]>([]);

  useEffect(() => {
    attemptService.getExamResults(parseInt(examId)).then(setResults);
  }, [examId]);

  // --- ฟังก์ชัน Export Excel ---
  const handleExport = () => {
    if (results.length === 0) return;

    // 1. เตรียมข้อมูลสำหรับ Excel (Map Data)
    const exportData = results.map((r, index) => {
        // Access user data safely
        const user = (r as any).user; 
        
        return {
            "ลำดับ": index + 1,
            "รหัสผู้ใช้งาน": user?.username || "-",
            "ชื่อ-นามสกุล": `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Unknown",
            "ระดับชั้น/ห้อง": user?.class_room || "-",
            "คะแนนที่ได้": r.score,
            "คะแนนเต็ม": r.max_score,
            "วันที่ส่งข้อสอบ": r.end_time ? format(new Date(r.end_time), "dd/MM/yyyy HH:mm") : "-",
            "สถานะ": r.is_submitted ? "ส่งแล้ว" : "ยังไม่ส่ง"
        };
    });

    // 2. สร้าง Worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // 3. ปรับความกว้างคอลัมน์ (Optional: เพื่อความสวยงาม)
    ws['!cols'] = [
        { wch: 10 }, // ลำดับ
        { wch: 15 }, // รหัส
        { wch: 25 }, // ชื่อ-สกุล
        { wch: 15 }, // ห้อง
        { wch: 10 }, // คะแนน
        { wch: 10 }, // เต็ม
        { wch: 20 }, // วันที่
        { wch: 10 }, // สถานะ
    ];

    // 4. สร้าง Workbook และ Download
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Exam Results");
    
    // ตั้งชื่อไฟล์ตาม ID วิชา
    XLSX.writeFile(wb, `exam_results_${examId}.xlsx`);
  };
  // ---------------------------

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            รายงานผลคะแนนสอบ
        </h2>
        
        {/* ปุ่ม Export */}
        <Button 
            variant="outline" 
            onClick={handleExport}
            disabled={results.length === 0}
            className="text-green-700 border-green-200 hover:bg-green-50"
        >
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>รายชื่อผู้เข้าสอบ ({results.length} คน)</CardTitle>
        </CardHeader>
        <CardContent>
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead className="w-[80px]">ลำดับ</TableHead>
                 <TableHead>รหัส/ห้อง</TableHead>
                 <TableHead>ชื่อผู้สอบ</TableHead>
                 <TableHead>เวลาส่ง</TableHead>
                 <TableHead className="text-right">คะแนน</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {results.map((r, i) => {
                 const user = (r as any).user;
                 return (
                    <TableRow key={r.ID}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-medium text-xs text-gray-500">{user?.username}</span>
                                {user?.class_room && (
                                    <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-0.5">
                                        ห้อง {user.class_room}
                                    </span>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <span className="font-medium">
                                {user?.first_name} {user?.last_name || ""}
                            </span>
                        </TableCell> 
                        <TableCell className="text-gray-600 text-sm">
                            {r.end_time ? format(new Date(r.end_time), "d MMM HH:mm", { locale: th }) : "-"}
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-600 text-lg">
                            {r.score} <span className="text-xs text-gray-400 font-normal">/ {r.max_score}</span>
                        </TableCell>
                    </TableRow>
                 );
               })}
             </TableBody>
           </Table>
        </CardContent>
      </Card>
    </div>
  );
}