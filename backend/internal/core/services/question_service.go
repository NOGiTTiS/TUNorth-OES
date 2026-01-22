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

func (s *questionService) UpdateQuestion(id uint, question *domain.Question) error {
    // Validate เหมือนตอน Create
	if question.Content == "" {
		return errors.New("question content is required")
	}
    // ... (Validation อื่นๆ)

	return s.repo.Update(id, question)
}

func (s *questionService) DeleteQuestion(id uint) error {
	return s.repo.Delete(id)
}

func (s *questionService) CreateQuestionsBulk(questions []domain.Question) error {
	if len(questions) == 0 {
		return errors.New("no questions to import")
	}

	// Validate ทุกข้อ
	for _, q := range questions {
		if q.Content == "" {
			return errors.New("some questions have empty content")
		}
        // ตรวจสอบว่ามีข้อถูกอย่างน้อย 1 ข้อ
		hasCorrect := false
		for _, c := range q.Choices {
			if c.IsCorrect {
				hasCorrect = true
				break
			}
		}
		if !hasCorrect {
			return errors.New("question '" + q.Content + "' has no correct answer")
		}
	}

    // GORM ฉลาดพอที่จะ Loop Create ให้เอง หรือจะเขียน Repo ให้รับ []Question ก็ได้
    // แต่เพื่อความง่าย เราจะวนลูปเรียก Create ใน Repo หรือแก้ Repo ให้รับ Slice
    // วิธีที่ดีสุดคือแก้ Repo ให้รับ Slice ครับ (Batch Insert)
    return s.repo.CreateBulk(questions)
}