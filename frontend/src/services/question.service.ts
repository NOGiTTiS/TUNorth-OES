import api from "@/lib/axios";
import { CreateQuestionInput, Question } from "@/types/question";

export const questionService = {
  getBySubjectId: async (subjectId: number) => {
    const response = await api.get<Question[]>(`/questions/subject/${subjectId}`);
    return response.data;
  },

  create: async (data: CreateQuestionInput) => {
    const response = await api.post("/questions", data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },
};