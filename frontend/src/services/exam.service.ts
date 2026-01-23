import api from "@/lib/axios";
import { CreateExamInput, Exam } from "@/types/exam";

export const examService = {
  getAll: async () => {
    const response = await api.get<Exam[]>("/exams");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Exam>(`/exams/${id}`);
    return response.data;
  },

  create: async (data: CreateExamInput) => {
    const response = await api.post("/exams", data);
    return response.data;
  },

  update: async (id: number, data: CreateExamInput) => {
    const response = await api.put(`/exams/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  },
};