import api from "@/lib/axios";
import { LoginRequest, LoginResponse, RegisterRequest } from "@/types/auth";

export const authService = {
  // ฟังก์ชันสำหรับยิง API Login
  login: async (data: LoginRequest) => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },
};