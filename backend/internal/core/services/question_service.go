package services

import (
	"errors"

	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
)

type questionService struct {
	repo ports.IQuestionRepository
}

func NewQuestionService(repo ports.IQuestionRepository) ports.IQuestionService {
	return &questionService{repo: repo}
}

func (s *questionService) CreateQuestion(question *domain.Question) error {
	if question.Content == "" {
		return errors.New("question content is required")
	}
	if len(question.Choices) < 2 {
		return errors.New("question must have at least 2 choices")
	}

	// Validate: ต้องมีข้อถูกอย่างน้อย 1 ข้อ
	hasCorrectAnswer := false
	for _, choice := range question.Choices {
		if choice.IsCorrect {
			hasCorrectAnswer = true
			break
		}
	}
	if !hasCorrectAnswer {
		return errors.New("question must have at least 1 correct answer")
	}

	return s.repo.Create(question)
}

func (s *questionService) GetQuestionsBySubjectID(subjectID uint) ([]domain.Question, error) {
	return s.repo.FindBySubjectID(subjectID)
}

func (s *questionService) DeleteQuestion(id uint) error {
	return s.repo.Delete(id)
}