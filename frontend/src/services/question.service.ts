import api from "@/lib/axios"
import { CreateQuestionInput, Question } from "@/types/question"

export const questionService = {
  getBySubjectId: async (subjectId: number) => {
    const response = await api.get<Question[]>(
      `/questions/subject/${subjectId}`,
    )
    return response.data
  },

  create: async (data: CreateQuestionInput) => {
    const response = await api.post("/questions", data)
    return response.data
  },

  update: async (id: number, data: CreateQuestionInput) => {
    const response = await api.put(`/questions/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/questions/${id}`)
    return response.data
  },

  createBulk: async (
    subjectId: number,
    questions: Omit<CreateQuestionInput, "subject_id">[],
  ) => {
    // โครงสร้าง JSON ที่ส่งไปต้องตรงกับ Backend DTO
    const payload = {
      subject_id: subjectId,
      questions: questions,
    }
    const response = await api.post("/questions/bulk", payload)
    return response.data
  },
}
