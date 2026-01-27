export interface User {
  ID: number
  username: string
  first_name: string
  last_name: string
  role: "admin" | "teacher" | "student"
  class?: { name: string } // รับค่าจาก Preload ("Class")
  class_room?: string // (Optional) อาจจะไม่ได้ใช้แล้ว แต่เก็บไว้ก่อนเผื่อโค้ดเก่า
  created_at: string
}

export interface UserFormInput {
  username: string
  password?: string // Optional เพราะตอนแก้ไม่ต้องใส่ก็ได้
  first_name: string
  last_name: string
  role: string
  class_room?: string
}
