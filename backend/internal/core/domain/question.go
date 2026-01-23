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
	SubjectID uint    `gorm:"not null;index" json:"subject_id"`
	Subject   Subject `gorm:"foreignKey:SubjectID" json:"-"`
	Content   string  `gorm:"type:text;not null" json:"content"`

	// --- ต้องมีบรรทัดนี้ ---
	ImageURL string `gorm:"type:varchar(255)" json:"image_url"`
	// --------------------

	Type       QuestionType `gorm:"type:varchar(20);default:'MCQ'" json:"type"`
	Difficulty int          `gorm:"default:1" json:"difficulty"`
	Choices    []Choice     `gorm:"foreignKey:QuestionID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"choices"`

	// Link to User who created it
	CreatedByID uint `gorm:"column:created_by_id" json:"created_by_id"`
}

// Choice ตารางเก็บตัวเลือก
type Choice struct {
	gorm.Model
	QuestionID uint   `gorm:"not null;index" json:"question_id"`
	Content    string `gorm:"type:text;not null" json:"content"`

	// --- ต้องมีบรรทัดนี้ ---
	ImageURL string `gorm:"type:varchar(255)" json:"image_url"`
	// --------------------

	IsCorrect bool `gorm:"default:false" json:"is_correct"`
}
