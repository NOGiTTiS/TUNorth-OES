package ports

import "github.com/nogittis/tunorth-oes-backend/internal/core/domain"

type IExamService interface {
	CreateExam(exam *domain.Exam, questionIDs []uint) error
	GetAllExams() ([]domain.Exam, error)
	GetExamByID(id uint) (*domain.Exam, error)
}

type IExamRepository interface {
	Create(exam *domain.Exam) error
	FindAll() ([]domain.Exam, error)
	FindByID(id uint) (*domain.Exam, error)
	AddQuestions(examID uint, questionIDs []uint) error // เพิ่มข้อสอบเข้าชุด
}