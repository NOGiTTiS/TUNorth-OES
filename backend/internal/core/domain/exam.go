package domain

import (
	"time"

	"gorm.io/gorm"
)

// Exam ตารางเก็บข้อมูลชุดข้อสอบ
type Exam struct {
	gorm.Model
	SubjectID   uint      `gorm:"not null;index" json:"subject_id"`
	Subject     Subject   `gorm:"foreignKey:SubjectID" json:"-"`
	Title       string    `gorm:"type:varchar(200);not null" json:"title" example:"สอบกลางภาค 2/2568"`
	Description string    `gorm:"type:text" json:"description"`
	Duration    int       `gorm:"not null" json:"duration" example:"60"` // เวลาทำข้อสอบ (นาที)
	StartTime   time.Time `json:"start_time" example:"2026-03-01T09:00:00Z"`
	EndTime     time.Time `json:"end_time" example:"2026-03-01T12:00:00Z"`

	// Relation: Exam is assigned to multiple Classes
	TargetClasses []Class `gorm:"many2many:exam_target_classes;" json:"target_classes,omitempty"`
	IsRandom      bool    `gorm:"default:true" json:"is_random"`  // เปิด-ปิด สุ่ม
	ShowScore     bool    `gorm:"default:true" json:"show_score"` // เปิด-ปิด แสดงคะแนน
	CreatedByID   uint    `json:"created_by_id"`
	// Relation: ชุดนี้มีข้อสอบอะไรบ้าง
	Questions []Question `gorm:"many2many:exam_questions;" json:"questions,omitempty"`
}

// ExamQuestion ตารางกลาง (Junction Table) สำหรับ Many-to-Many
// เก็บว่า ExamID นี้ คู่กับ QuestionID ไหน
type ExamQuestion struct {
	ExamID     uint `gorm:"primaryKey"`
	QuestionID uint `gorm:"primaryKey"`
}
