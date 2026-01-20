package ports

import "github.com/nogittis/tunorth-oes-backend/internal/core/domain"

// ISubjectService: เมธอดที่ Handler เรียกใช้
type ISubjectService interface {
	CreateSubject(subject *domain.Subject) error
	GetAllSubjects() ([]domain.Subject, error)
	GetSubjectByID(id uint) (*domain.Subject, error)
	UpdateSubject(id uint, subject *domain.Subject) error
	DeleteSubject(id uint) error
}

// ISubjectRepository: เมธอดที่ Service เรียกใช้เพื่อคุยกับ DB
type ISubjectRepository interface {
	Create(subject *domain.Subject) error
	FindAll() ([]domain.Subject, error)
	FindByID(id uint) (*domain.Subject, error)
	Update(subject *domain.Subject) error
	Delete(id uint) error
}