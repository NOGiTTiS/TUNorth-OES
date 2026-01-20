"use client";

import { useEffect, useState, use } from "react"; // อย่าลืม use
import { attemptService } from "@/services/attempt.service";
import { ExamAttempt } from "@/types/attempt";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function ExamResultsPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = use(params);
  const [results, setResults] = useState<ExamAttempt[]>([]);

  useEffect(() => {
    attemptService.getExamResults(parseInt(examId)).then(setResults);
  }, [examId]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">รายงานผลคะแนนสอบ</h2>
      <Card>
        <CardHeader><CardTitle>รายชื่อผู้เข้าสอบ ({results.length} คน)</CardTitle></CardHeader>
        <CardContent>
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>ลำดับ</TableHead>
                 <TableHead>ชื่อผู้สอบ</TableHead>
                 <TableHead>เวลาส่ง</TableHead>
                 <TableHead className="text-right">คะแนน</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {results.map((r, i) => (
                 <TableRow key={r.ID}>
                   <TableCell>{i + 1}</TableCell>
                   <TableCell>
                      {/* ต้องแก้ Type Frontend ให้มี User ด้วย หรือใช้ any ไปก่อนถ้าขี้เกียจแก้ Type */}
                      {(r as any).User?.username || "Unknown"} 
                   </TableCell> 
                   <TableCell>{format(new Date(r.end_time!), "d MMM HH:mm", { locale: th })}</TableCell>
                   <TableCell className="text-right font-bold text-blue-600">
                     {r.score} / {r.max_score}
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
        </CardContent>
      </Card>
    </div>
  );
}