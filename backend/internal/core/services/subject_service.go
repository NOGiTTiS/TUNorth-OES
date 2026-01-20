package services

import (
	"errors"

	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
)

type subjectService struct {
	repo ports.ISubjectRepository
}

func NewSubjectService(repo ports.ISubjectRepository) ports.ISubjectService {
	return &subjectService{repo: repo}
}

func (s *subjectService) CreateSubject(subject *domain.Subject) error {
	if subject.Code == "" || subject.Name == "" {
		return errors.New("code and name are required")
	}
	return s.repo.Create(subject)
}

func (s *subjectService) GetAllSubjects() ([]domain.Subject, error) {
	return s.repo.FindAll()
}

func (s *subjectService) GetSubjectByID(id uint) (*domain.Subject, error) {
	return s.repo.FindByID(id)
}

func (s *subjectService) UpdateSubject(id uint, input *domain.Subject) error {
	// 1. หาของเดิมก่อน
	existing, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	
	// 2. อัปเดตค่า (ถ้าส่งมา)
	if input.Code != "" { existing.Code = input.Code }
	if input.Name != "" { existing.Name = input.Name }
	if input.Description != "" { existing.Description = input.Description }
	existing.IsActive = input.IsActive // bool ต้องระวังนิดหน่อย แต่วิธีนี้ง่ายสุดสำหรับตอนนี้

	// 3. บันทึก
	return s.repo.Update(existing)
}

func (s *subjectService) DeleteSubject(id uint) error {
	return s.repo.Delete(id)
}