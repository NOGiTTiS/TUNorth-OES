package services

import (
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
)

type dashboardService struct {
	userRepo    ports.IUserRepository
	examRepo    ports.IExamRepository
	attemptRepo ports.IAttemptRepository
}

func NewDashboardService(
	userRepo ports.IUserRepository,
	examRepo ports.IExamRepository,
	attemptRepo ports.IAttemptRepository,
) ports.IDashboardService {
	return &dashboardService{
		userRepo:    userRepo,
		examRepo:    examRepo,
		attemptRepo: attemptRepo,
	}
}

func (s *dashboardService) GetAdminStats() (*ports.DashboardStats, error) {
	totalStudents, err := s.userRepo.CountAll()
	if err != nil {
		return nil, err
	}

	activeExams, err := s.examRepo.CountActive()
	if err != nil {
		return nil, err
	}

	submittedAnswers, err := s.attemptRepo.CountSubmitted()
	if err != nil {
		return nil, err
	}

	return &ports.DashboardStats{
		TotalStudents:    totalStudents,
		ActiveExams:      activeExams,
		SubmittedAnswers: submittedAnswers,
	}, nil
}
