import api from "@/lib/axios";
import { User, UserFormInput } from "@/types/user";

export const userService = {
  getAll: async () => {
    const response = await api.get<User[]>("/users");
    return response.data;
  },

  // เพิ่ม Create
  create: async (data: UserFormInput) => {
    const response = await api.post("/users", data);
    return response.data;
  },

  // เพิ่ม Update
  update: async (id: number, data: UserFormInput) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  createBulk: async (users: UserFormInput[]) => {
    const response = await api.post("/users/bulk", { users });
    return response.data;
  },
};