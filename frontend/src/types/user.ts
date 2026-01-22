export interface User {
  ID: number;
  username: string;
  first_name: string;
  last_name: string;
  role: "admin" | "teacher" | "student";
  class_room?: string;
  created_at: string;
}

export interface UserFormInput {
  username: string;
  password?: string; // Optional เพราะตอนแก้ไม่ต้องใส่ก็ได้
  first_name: string;
  last_name: string;
  role: string;
  class_room?: string;
}