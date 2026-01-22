export interface User {
  ID: number;
  username: string;
  first_name: string;
  last_name: string;
  role: "admin" | "teacher" | "student";
  created_at: string;
}