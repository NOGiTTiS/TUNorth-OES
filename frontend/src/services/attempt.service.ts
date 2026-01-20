import api from "@/lib/axios";
import { ExamAttempt, ExamAnswer } from "@/types/attempt";

export const attemptService = {
  // เริ่มทำข้อสอบ (หรือทำต่อถ้าหลุดไป)
  start: async (examId: number) => {
    const response = await api.post<ExamAttempt>("/attempts/start", { exam_id: examId });
    return response.data;
  },

  // ส่งคำตอบ
  submit: async (attemptId: number, answers: ExamAnswer[]) => {
    const response = await api.post("/attempts/submit", {
      attempt_id: attemptId,
      answers: answers,
    });
    return response.data;
  },

  // ดูประวัติ
  getHistory: async () => {
    const response = await api.get<ExamAttempt[]>("/attempts/history");
    return response.data;
  },

  // เพิ่มฟังก์ชันนี้เข้าไปครับ (สำหรับครูดูผลสอบ)
  getExamResults: async (examId: number) => {
    const response = await api.get<ExamAttempt[]>(`/attempts/exam/${examId}`);
    return response.data;
  },
};