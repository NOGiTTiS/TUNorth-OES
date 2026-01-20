package services

import (
	"errors"

	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
)

type examService struct {
	repo ports.IExamRepository
}

func NewExamService(repo ports.IExamRepository) ports.IExamService {
	return &examService{repo: repo}
}

func (s *examService) CreateExam(exam *domain.Exam, questionIDs []uint) error {
	// Validation
	if exam.Title == "" {
		return errors.New("title is required")
	}
	if exam.StartTime.After(exam.EndTime) {
		return errors.New("start time must be before end time")
	}
	if exam.Duration <= 0 {
		return errors.New("duration must be greater than 0")
	}
	if len(questionIDs) == 0 {
		return errors.New("exam must have at least 1 question")
	}

	// 1. สร้างหัวข้อสอบก่อน
	if err := s.repo.Create(exam); err != nil {
		return err
	}

	// 2. เพิ่มข้อสอบเข้าชุด
	return s.repo.AddQuestions(exam.ID, questionIDs)
}

func (s *examService) GetAllExams() ([]domain.Exam, error) {
	return s.repo.FindAll()
}

func (s *examService) GetExamByID(id uint) (*domain.Exam, error) {
	return s.repo.FindByID(id)
}