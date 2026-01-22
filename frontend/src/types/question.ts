export interface Choice {
  ID?: number; // มีเครื่องหมาย ? เพราะตอนสร้างใหม่ยังไม่มี ID
  content: string;
  image_url?: string;
  is_correct: boolean;
}

export interface Question {
  ID: number;
  subject_id: number;
  content: string;
  image_url?: string;
  difficulty: number;
  choices: Choice[];
}

export interface CreateQuestionInput {
  subject_id: number;
  content: string;
  image_url?: string;
  difficulty: number;
  choices: {
    content: string;
    is_correct: boolean;
  }[];
}