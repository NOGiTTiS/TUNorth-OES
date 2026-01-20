package domain

import (
	"time"

	"gorm.io/gorm"
)

// ExamAttempt: เก็บข้อมูลการเข้าสอบ 1 ครั้ง
type ExamAttempt struct {
	gorm.Model
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"-"`
	ExamID    uint      `gorm:"not null;index" json:"exam_id"`
	Exam      Exam      `gorm:"foreignKey:ExamID" json:"exam"`
	
	StartTime time.Time `json:"start_time"`
	EndTime   time.Time `json:"end_time"`         // เวลาที่กดส่งข้อสอบ
	Score     int       `json:"score"`            // คะแนนรวมที่ได้
	MaxScore  int       `json:"max_score"`        // คะแนนเต็ม (จำนวนข้อ)
	IsSubmitted bool    `gorm:"default:false" json:"is_submitted"`
	
	// Relation: ตอบข้อไหนไปบ้าง
	Answers   []ExamAnswer `gorm:"foreignKey:AttemptID" json:"answers,omitempty"`
}

// ExamAnswer: เก็บคำตอบรายข้อ (เพื่อมาดูย้อนหลังได้)
type ExamAnswer struct {
	gorm.Model
	AttemptID       uint `gorm:"not null;index"`
	QuestionID      uint `gorm:"not null"`
	SelectedChoiceID uint `gorm:"not null"` // choice ที่นักเรียนเลือก
}