"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, HelpCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { QuestionDialog } from "@/components/features/questions/question-dialog";
import { subjectService } from "@/services/subject.service";
import { questionService } from "@/services/question.service";
import { Subject } from "@/types/subject";
import { Question } from "@/types/question";
import { cn } from "@/lib/utils";

export default function QuestionsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // โหลดรายชื่อวิชาตอนเข้ามาครั้งแรก
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await subjectService.getAll();
        setSubjects(data);
      } catch (error) {
        toast.error("โหลดรายวิชาไม่สำเร็จ");
      }
    };
    loadSubjects();
  }, []);

  // โหลดข้อสอบเมื่อเลือกวิชา
  const fetchQuestions = async (subjectId: string) => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const data = await questionService.getBySubjectId(parseInt(subjectId));
      setQuestions(data);
    } catch (error) {
      toast.error("โหลดข้อสอบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubjectId) {
      fetchQuestions(selectedSubjectId);
    } else {
      setQuestions([]);
    }
  }, [selectedSubjectId]);

  const handleDelete = async (id: number) => {
    if (!confirm("คุณต้องการลบข้อสอบข้อนี้ใช่หรือไม่?")) return;
    try {
      await questionService.delete(id);
      toast.success("ลบข้อสอบสำเร็จ");
      fetchQuestions(selectedSubjectId); // Reload
    } catch (error) {
      toast.error("ลบข้อสอบไม่สำเร็จ");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            คลังข้อสอบ
          </h2>
          <p className="text-gray-500">
            เลือกรายวิชาเพื่อจัดการข้อสอบในคลัง
          </p>
        </div>
        <Button 
          onClick={() => setDialogOpen(true)} 
          disabled={!selectedSubjectId} // ห้ามกดถ้ายังไม่เลือกวิชา
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" /> เพิ่มข้อสอบ
        </Button>
      </div>

      {/* Dropdown เลือกวิชา */}
      <div className="w-[300px]">
        <Select onValueChange={setSelectedSubjectId} value={selectedSubjectId}>
          <SelectTrigger>
            <SelectValue placeholder="-- เลือกรายวิชา --" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((sub) => (
              <SelectItem key={sub.ID} value={sub.ID.toString()}>
                {sub.code} - {sub.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* รายการข้อสอบ */}
      <div className="bg-white rounded-lg border shadow-sm p-4 min-h-[300px]">
        {!selectedSubjectId ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <HelpCircle className="h-10 w-10 mb-2" />
            <p>กรุณาเลือกรายวิชาเพื่อดูข้อสอบ</p>
          </div>
        ) : loading ? (
          <div className="text-center py-10">กำลังโหลดข้อสอบ...</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            ยังไม่มีข้อสอบในวิชานี้
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {questions.map((q, index) => (
              <AccordionItem key={q.ID} value={q.ID.toString()}>
                <AccordionTrigger className="hover:no-underline px-2">
                  <div className="flex items-center gap-4 text-left">
                    <span className="font-bold text-blue-600">#{index + 1}</span>
                    <span className="line-clamp-1">{q.content}</span>
                    <Badge variant={q.difficulty === 1 ? "secondary" : q.difficulty === 2 ? "default" : "destructive"}>
                      {q.difficulty === 1 ? "ง่าย" : q.difficulty === 2 ? "ปานกลาง" : "ยาก"}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-slate-50 p-4 rounded-md">
                  <div className="space-y-2">
                    <p className="font-medium text-lg mb-4">{q.content}</p>
                    <div className="grid gap-2">
                      {q.choices.map((choice) => (
                        <div 
                          key={choice.ID} 
                          className={cn(
                            "p-3 rounded border flex items-center gap-3",
                            choice.is_correct ? "bg-green-50 border-green-200" : "bg-white"
                          )}
                        >
                          {choice.is_correct ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border border-gray-300" />
                          )}
                          <span className={cn(choice.is_correct && "font-medium text-green-700")}>
                            {choice.content}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDelete(q.ID)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> ลบข้อสอบ
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <QuestionDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        subjectId={parseInt(selectedSubjectId)}
        onSuccess={() => fetchQuestions(selectedSubjectId)}
      />
    </div>
  );
}