import api from "@/lib/axios";
import { Subject, SubjectFormInput } from "@/types/subject";

export const subjectService = {
  getAll: async () => {
    const response = await api.get<Subject[]>("/subjects");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Subject>(`/subjects/${id}`);
    return response.data;
  },

  create: async (data: SubjectFormInput) => {
    const response = await api.post("/subjects", data);
    return response.data;
  },

  update: async (id: number, data: SubjectFormInput) => {
    const response = await api.put(`/subjects/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  },
};