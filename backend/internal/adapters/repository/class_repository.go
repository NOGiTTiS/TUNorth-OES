package repository

import (
	"errors"

	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
	"gorm.io/gorm"
)

type classRepository struct {
	db *gorm.DB
}

func NewClassRepository(db *gorm.DB) ports.ClassRepository {
	return &classRepository{db: db}
}

func (r *classRepository) Create(class *domain.Class) error {
	return r.db.Create(class).Error
}

func (r *classRepository) FindAll() ([]domain.Class, error) {
	var classes []domain.Class
	err := r.db.Find(&classes).Error
	return classes, err
}

func (r *classRepository) FindByID(id uint) (*domain.Class, error) {
	var class domain.Class
	err := r.db.Preload("Students").First(&class, id).Error // Preload Students
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &class, nil
}

func (r *classRepository) Update(class *domain.Class) error {
	return r.db.Save(class).Error
}

func (r *classRepository) Delete(id uint) error {
	return r.db.Delete(&domain.Class{}, id).Error
}
