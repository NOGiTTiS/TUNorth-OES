// หน้าตาข้อมูลที่ส่งไป Login
export interface LoginRequest {
  username: string;
  password: string;
}

// หน้าตาข้อมูลที่ได้ตอบกลับมาจาก Login
export interface LoginResponse {
  message: string;
  token: string;
}

// ข้อมูล User ที่เราจะถอดรหัสจาก JWT (Decoded Token)
export interface UserInfo {
  user_id: number;
  username: string;
  role: "admin" | "teacher" | "student";
  exp: number; // วันหมดอายุ token
}

export interface RegisterRequest {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  role: "student" | "teacher"; // ให้เลือกได้แค่นี้ (Admin ต้องแก้ใน DB เอา)
}