package ports

import "github.com/nogittis/tunorth-oes-backend/internal/core/domain"

type IQuestionService interface {
	CreateQuestion(question *domain.Question) error
	GetQuestionsBySubjectID(subjectID uint) ([]domain.Question, error)
	DeleteQuestion(id uint) error
	CreateQuestionsBulk(questions []domain.Question) error
	UpdateQuestion(id uint, question *domain.Question) error
}

type IQuestionRepository interface {
	Create(question *domain.Question) error
	FindBySubjectID(subjectID uint) ([]domain.Question, error)
	Delete(id uint) error
	CreateBulk(questions []domain.Question) error
	Update(id uint, question *domain.Question) error
}