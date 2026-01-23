package ports

import "github.com/nogittis/tunorth-oes-backend/internal/core/domain"

type IExamService interface {
	CreateExam(exam *domain.Exam, questionIDs []uint) error
	GetAllExams() ([]domain.Exam, error)
	GetExamByID(id uint) (*domain.Exam, error)
	GetExamsForStudent(userID uint) ([]domain.Exam, error) // สำหรับนักเรียน
	UpdateExam(id uint, exam *domain.Exam, questionIDs []uint) error
	DeleteExam(id uint) error                              // สำหรับลบ
}

type IExamRepository interface {
	Create(exam *domain.Exam) error
	FindAll() ([]domain.Exam, error)
	FindByID(id uint) (*domain.Exam, error)
	AddQuestions(examID uint, questionIDs []uint) error // เพิ่มข้อสอบเข้าชุด
	FindByClass(classRoom string) ([]domain.Exam, error) // หาตามห้องเรียน
	Update(exam *domain.Exam, questionIDs []uint) error
	Delete(id uint) error
}