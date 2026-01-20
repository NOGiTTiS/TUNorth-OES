package repository

import (
	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
	"gorm.io/gorm"
)

type subjectRepo struct {
	db *gorm.DB
}

func NewSubjectRepository(db *gorm.DB) ports.ISubjectRepository {
	return &subjectRepo{db: db}
}

func (r *subjectRepo) Create(subject *domain.Subject) error {
	return r.db.Create(subject).Error
}

func (r *subjectRepo) FindAll() ([]domain.Subject, error) {
	var subjects []domain.Subject
	// เรียงตามรหัสวิชา
	err := r.db.Order("code asc").Find(&subjects).Error
	return subjects, err
}

func (r *subjectRepo) FindByID(id uint) (*domain.Subject, error) {
	var subject domain.Subject
	err := r.db.First(&subject, id).Error
	if err != nil {
		return nil, err
	}
	return &subject, nil
}

func (r *subjectRepo) Update(subject *domain.Subject) error {
	return r.db.Save(subject).Error
}

func (r *subjectRepo) Delete(id uint) error {
	return r.db.Delete(&domain.Subject{}, id).Error
}