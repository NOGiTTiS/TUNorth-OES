import { create } from "zustand";
import { UserInfo } from "@/types/auth";

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  
  // Actions (ฟังก์ชันสำหรับเปลี่ยนค่า)
  setLogin: (token: string, user: UserInfo) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setLogin: (token, user) => {
    // เก็บลง LocalStorage ด้วย เพื่อให้กด Refresh แล้วไม่หลุด
    localStorage.setItem("token", token);
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null, isAuthenticated: false });
  },
}));