import { Exam } from "./exam";

export interface ExamAnswer {
  question_id: number;
  choice_id: number;
}

export interface ExamAttempt {
  ID: number;
  user_id: number;
  exam_id: number;
  exam?: Exam; // เผื่อมีการ Preload
  start_time: string;
  end_time?: string;
  score: number;
  max_score: number;
  is_submitted: boolean;
}