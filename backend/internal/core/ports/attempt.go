package ports

import "github.com/nogittis/tunorth-oes-backend/internal/core/domain"

// DTO สำหรับรับคำตอบจากนักเรียน
type SubmitAnswerRequest struct {
	QuestionID uint `json:"question_id"`
	ChoiceID   uint `json:"choice_id"`
}

type IAttemptService interface {
	StartExam(userID, examID uint) (*domain.ExamAttempt, error)
	SubmitExam(attemptID uint, answers []SubmitAnswerRequest) (*domain.ExamAttempt, error)
	GetStudentHistory(userID uint) ([]domain.ExamAttempt, error)
}

type IAttemptRepository interface {
	Create(attempt *domain.ExamAttempt) error
	Update(attempt *domain.ExamAttempt) error
	FindByID(id uint) (*domain.ExamAttempt, error)
	FindByUser(userID uint) ([]domain.ExamAttempt, error)
	// ฟังก์ชันช่วยเช็คว่าสอบไปหรือยัง
	FindActiveAttempt(userID, examID uint) (*domain.ExamAttempt, error)
}