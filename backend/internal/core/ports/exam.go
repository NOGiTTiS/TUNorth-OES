package ports

import "github.com/nogittis/tunorth-oes-backend/internal/core/domain"

type IExamService interface {
	CreateExam(exam *domain.Exam, questionIDs []uint) error
	GetAllExams(requesterID uint, requesterRole string) ([]domain.Exam, error)
	GetExamByID(id uint) (*domain.Exam, error)
	GetExamsForStudent(userID uint) ([]domain.Exam, error) // สำหรับนักเรียน
	UpdateExam(id uint, exam *domain.Exam, questionIDs []uint) error
	DeleteExam(id uint) error // สำหรับลบ
}

type IExamRepository interface {
	Create(exam *domain.Exam) error
	FindAll(creatorID uint) ([]domain.Exam, error)
	FindByID(id uint) (*domain.Exam, error)
	AddQuestions(examID uint, questionIDs []uint) error // เพิ่มข้อสอบเข้าชุด
	FindByClass(classID uint) ([]domain.Exam, error)    // หาตามห้องเรียน
	Update(exam *domain.Exam, questionIDs []uint) error
	Delete(id uint) error
	CountActive() (int64, error)
}
