package domain

import "gorm.io/gorm"

// QuestionType ประเภทข้อสอบ
type QuestionType string

const (
	MCQ QuestionType = "MCQ" // ปรนัย (เลือกตอบ)
)

// Question ตารางเก็บโจทย์
type Question struct {
	gorm.Model
	SubjectID uint         `gorm:"not null;index" json:"subject_id"`     // ผูกกับวิชาไหน
	Subject   Subject      `gorm:"foreignKey:SubjectID" json:"-"`        // Relation (ไม่ส่งกลับ JSON)
	Content   string       `gorm:"type:text;not null" json:"content"`    // เนื้อหาโจทย์
	Type      QuestionType `gorm:"type:varchar(20);default:'MCQ'" json:"type"`
	Difficulty int         `gorm:"default:1" json:"difficulty"`          // 1=ง่าย, 2=กลาง, 3=ยาก
	Choices   []Choice     `gorm:"foreignKey:QuestionID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"choices"`
}

// Choice ตารางเก็บตัวเลือก
type Choice struct {
	gorm.Model
	QuestionID uint   `gorm:"not null;index" json:"question_id"`
	Content    string `gorm:"type:text;not null" json:"content"`
	IsCorrect  bool   `gorm:"default:false" json:"is_correct"` // เป็นคำตอบที่ถูกหรือไม่
}