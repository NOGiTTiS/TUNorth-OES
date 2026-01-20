import api from "@/lib/axios";
import { LoginRequest, LoginResponse } from "@/types/auth";

export const authService = {
  // ฟังก์ชันสำหรับยิง API Login
  login: async (data: LoginRequest) => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  // (ในอนาคต) ฟังก์ชัน Register, Logout, GetProfile ก็จะมาอยู่ที่นี่
};