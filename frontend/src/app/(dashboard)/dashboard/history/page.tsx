"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Trophy, Calendar, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { attemptService } from "@/services/attempt.service";
import { ExamAttempt } from "@/types/attempt";

export default function HistoryPage() {
  const [history, setHistory] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await attemptService.getHistory();
        setHistory(data);
      } catch (error) {
        toast.error("โหลดประวัติการสอบไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // ฟังก์ชันแสดงผลคะแนน (รองรับการซ่อนคะแนน)
  const renderScore = (attempt: ExamAttempt) => {
    // ถ้า Backend ส่งค่า -1 มา แปลว่าครูปิด ShowScore ไว้
    if (attempt.score === -1) {
        return (
            <span className="text-gray-400 text-sm italic flex justify-end items-center gap-1">
                <Clock className="h-3 w-3" /> รอประกาศผล
            </span>
        );
    }
    
    // กรณีปกติ แสดงคะแนน
    return (
        <div className="flex items-center justify-end gap-2 font-bold text-lg text-blue-600">
            <Trophy className="h-4 w-4 text-yellow-500" />
            {attempt.score} <span className="text-sm text-gray-400 font-normal">/ {attempt.max_score}</span>
        </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          ประวัติการสอบ
        </h2>
        <p className="text-gray-500">รายการสอบที่ผ่านมาและคะแนนที่ได้</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการสอบล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">กำลังโหลดข้อมูล...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-400 flex flex-col items-center border-dashed border-2 rounded-lg m-4">
              <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
              คุณยังไม่เคยเข้าสอบรายการใด
            </div>
          ) : (
            <div className="rounded-md border">
                <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50">
                    <TableHead>ชื่อการสอบ</TableHead>
                    <TableHead>วันที่สอบ</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">คะแนน</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {history.map((item) => (
                    <TableRow key={item.ID} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium">
                        <div className="flex flex-col">
                            <span className="text-base text-blue-900 font-semibold">{item.exam?.title || "ไม่พบข้อมูลสอบ"}</span>
                            <span className="text-xs text-gray-500 bg-slate-100 px-2 py-0.5 rounded w-fit mt-1">
                            {item.exam?.subject?.code} {item.exam?.subject?.name}
                            </span>
                        </div>
                        </TableCell>
                        <TableCell>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            {format(new Date(item.start_time), "d MMM yy HH:mm", {
                            locale: th,
                            })}
                        </div>
                        </TableCell>
                        <TableCell>
                        {item.is_submitted ? (
                            <Badge className="bg-green-600 hover:bg-green-700">ส่งแล้ว</Badge>
                        ) : (
                            <Badge variant="destructive">หมดเวลา/ยังไม่ส่ง</Badge>
                        )}
                        </TableCell>
                        <TableCell className="text-right">
                            {renderScore(item)}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}