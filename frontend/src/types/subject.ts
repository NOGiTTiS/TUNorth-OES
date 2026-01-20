export interface Subject {
  ID: number;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

// ข้อมูลสำหรับตอนสร้างหรือแก้ไข (ไม่ต้องส่ง ID ไป)
export interface SubjectFormInput {
  code: string;
  name: string;
  description?: string;
}