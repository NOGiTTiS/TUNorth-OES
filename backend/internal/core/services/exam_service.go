package services

import (
	"errors"
	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
)

type examService struct {
	repo ports.IExamRepository
	userRepo ports.IUserRepository
}

func NewExamService(repo ports.IExamRepository, userRepo ports.IUserRepository) ports.IExamService {
	return &examService{
		repo:     repo,
		userRepo: userRepo,
	}
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

func (s *examService) GetExamsForStudent(userID uint) ([]domain.Exam, error) {
	// 1. ไปดูข้อมูลนักเรียนก่อน ว่าอยู่ห้องไหน
	user, err := s.userRepo.FindByID(userID) // ต้องมั่นใจว่าใน IUserRepository มี FindByID แล้ว (ถ้าไม่มีต้องไปเพิ่ม)
	// หมายเหตุ: ปกติ FindByID ของ User มักจะมีอยู่แล้ว ถ้ายังไม่มีให้ไปเพิ่มใน ports/user.go และ user_repo.go ครับ
	
	if err != nil {
		return nil, err
	}
	if user.ClassRoom == "" {
		return nil, errors.New("student has no class assigned")
	}

	// 2. ค้นหาข้อสอบที่เปิดให้ห้องนั้นสอบ
	return s.repo.FindByClass(user.ClassRoom)
}

func (s *examService) UpdateExam(id uint, exam *domain.Exam, questionIDs []uint) error {
	// Validation เหมือน Create
	if exam.Title == "" {
		return errors.New("title is required")
	}
	if exam.StartTime.After(exam.EndTime) {
		return errors.New("start time must be before end time")
	}
	if len(questionIDs) == 0 {
		return errors.New("exam must have at least 1 question")
	}

	exam.ID = id // ระบุ ID ที่จะแก้
	return s.repo.Update(exam, questionIDs)
}

func (s *examService) DeleteExam(id uint) error {
	return s.repo.Delete(id)
}