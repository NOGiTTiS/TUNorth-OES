import { Subject } from "./subject"
import { Question } from "./question"

export interface Exam {
  ID: number
  title: string
  description: string
  subject_id: number
  subject?: Subject
  duration: number // นาที
  start_time: string
  end_time: string
  questions?: Question[]
  target_classes?: { ID: number; name: string }[]
  is_random: boolean
  show_score: boolean
}

export interface CreateExamInput {
  title: string
  description?: string
  subject_id: number
  duration: number
  start_time: string
  end_time: string
  question_ids: number[]
  target_classes: string[]
  is_random: boolean
  show_score: boolean
}
