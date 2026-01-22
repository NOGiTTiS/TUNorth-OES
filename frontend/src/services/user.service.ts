import api from "@/lib/axios";
import { User } from "@/types/user";

export const userService = {
  getAll: async () => {
    const response = await api.get<User[]>("/users");
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};