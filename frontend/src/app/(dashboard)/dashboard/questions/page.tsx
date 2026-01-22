"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2, HelpCircle, FileUp, Pencil, Image as ImageIcon, CheckCircle2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

import { QuestionDialog } from "@/components/features/questions/question-dialog";
import { ImportDialog } from "@/components/features/questions/import-dialog";
import { subjectService } from "@/services/subject.service";
import { questionService } from "@/services/question.service";
import { Subject } from "@/types/subject";
import { Question } from "@/types/question";

export default function QuestionsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State ควบคุม Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

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

  const handleCreate = () => {
    setEditingQuestion(null);
    setDialogOpen(true);
  };

  const handleEdit = (q: Question) => {
    setEditingQuestion(q);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("คุณต้องการลบข้อสอบข้อนี้ใช่หรือไม่?")) return;
    try {
      await questionService.delete(id);
      toast.success("ลบข้อสอบสำเร็จ");
      fetchQuestions(selectedSubjectId);
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
            เลือกรายวิชา เพื่อจัดการ เพิ่ม/ลบ/แก้ไข ข้อสอบในคลัง
          </p>
        </div>
        
        <div className="flex gap-2">
            {/* ปุ่มนำเข้า Excel */}
            <Button 
                variant="outline"
                onClick={() => setImportDialogOpen(true)}
                disabled={!selectedSubjectId}
            >
                <FileUp className="mr-2 h-4 w-4" /> นำเข้า Excel
            </Button>

            {/* ปุ่มเพิ่มข้อสอบ */}
            <Button 
                onClick={handleCreate} 
                disabled={!selectedSubjectId}
                className="bg-blue-600 hover:bg-blue-700"
            >
                <Plus className="mr-2 h-4 w-4" /> เพิ่มข้อสอบ
            </Button>
        </div>
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
            <p>กรุณาเลือกรายวิชาด้านบนเพื่อจัดการ</p>
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
                  <div className="flex items-center gap-4 text-left w-full">
                    <span className="font-bold text-blue-600">#{index + 1}</span>
                    <span className="line-clamp-1 flex-1">{q.content}</span>
                    
                    {/* ไอคอนรูปภาพ (ถ้ามีรูป) */}
                    {(q.image_url || q.choices.some(c => c.image_url)) && (
                        <ImageIcon className="h-4 w-4 text-blue-500 mr-2" />
                    )}

                    <Badge variant={q.difficulty === 1 ? "secondary" : q.difficulty === 2 ? "default" : "destructive"}>
                      {q.difficulty === 1 ? "ง่าย" : q.difficulty === 2 ? "ปานกลาง" : "ยาก"}
                    </Badge>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="bg-slate-50 p-4 rounded-md">
                  <div className="space-y-4">
                    {/* ส่วนแสดงโจทย์ */}
                    <div className="flex flex-col gap-4">
                        <p className="font-medium text-lg">{q.content}</p>
                        {q.image_url && (
                            <div className="relative h-60 w-full max-w-md rounded-lg overflow-hidden border bg-white shadow-sm">
                                <Image 
                                    src={q.image_url} 
                                    alt="Question Image" 
                                    fill 
                                    className="object-contain" 
                                    sizes="(max-width: 768px) 100vw, 500px" 
                                />
                            </div>
                        )}
                    </div>

                    {/* ส่วนแสดงตัวเลือก */}
                    <div className="grid gap-2">
                      {q.choices.map((choice) => (
                        <div 
                          key={choice.ID} 
                          className={cn(
                            "p-3 rounded border flex items-start gap-3",
                            choice.is_correct ? "bg-green-50 border-green-200" : "bg-white"
                          )}
                        >
                          {choice.is_correct ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-1" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border border-gray-300 shrink-0 mt-1" />
                          )}
                          
                          <div className="flex flex-col gap-2 w-full">
                              <span className={cn(choice.is_correct && "font-medium text-green-700")}>
                                {choice.content}
                              </span>
                              {choice.image_url && (
                                <div className="relative h-32 w-32 rounded-md overflow-hidden border">
                                    <Image 
                                        src={choice.image_url} 
                                        alt="Choice Image" 
                                        fill 
                                        className="object-cover" 
                                        sizes="150px"
                                    />
                                </div>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ปุ่มจัดการ Edit/Delete */}
                    <div className="flex justify-end pt-4 gap-2 border-t mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(q)}
                      >
                        <Pencil className="mr-2 h-4 w-4" /> แก้ไข
                      </Button>

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

      {/* Dialog สร้าง/แก้ไข */}
      <QuestionDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        subjectId={parseInt(selectedSubjectId)}
        onSuccess={() => fetchQuestions(selectedSubjectId)}
        questionToEdit={editingQuestion}
      />

      {/* Dialog นำเข้า Excel */}
      <ImportDialog 
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        subjectId={parseInt(selectedSubjectId)}
        onSuccess={() => fetchQuestions(selectedSubjectId)}
      />
    </div>
  );
}