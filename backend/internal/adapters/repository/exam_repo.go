package repository

import (
	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
	"gorm.io/gorm"
)

type examRepo struct {
	db *gorm.DB
}

func NewExamRepository(db *gorm.DB) ports.IExamRepository {
	return &examRepo{db: db}
}

func (r *examRepo) Create(exam *domain.Exam) error {
	return r.db.Create(exam).Error
}

func (r *examRepo) FindAll() ([]domain.Exam, error) {
	var exams []domain.Exam
	// Preload Subject เพื่อให้รู้ว่าเป็นวิชาอะไร
	err := r.db.Preload("Subject").Order("created_at desc").Find(&exams).Error
	return exams, err
}

func (r *examRepo) FindByID(id uint) (*domain.Exam, error) {
	var exam domain.Exam
	// Preload ทั้ง Subject และ Questions (พร้อม Choices)
	err := r.db.Preload("Subject").
		Preload("Questions").
		Preload("Questions.Choices").
		First(&exam, id).Error
	return &exam, err
}

func (r *examRepo) AddQuestions(examID uint, questionIDs []uint) error {
	// ใช้ Association Mode ของ GORM จัดการ Many-to-Many
	var exam domain.Exam
	exam.ID = examID
	
	// สร้าง Slice ของ Question struct เพื่อส่งให้ GORM
	var questions []domain.Question
	for _, qID := range questionIDs {
		questions = append(questions, domain.Question{Model: gorm.Model{ID: qID}})
	}

	return r.db.Model(&exam).Association("Questions").Append(questions)
}