package services

import (
	"errors"

	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
)

// ClassService implements the ClassService interface
type classService struct {
	classRepo ports.ClassRepository
}

// NewClassService creates a new instance of ClassService
func NewClassService(classRepo ports.ClassRepository) ports.ClassService {
	return &classService{
		classRepo: classRepo,
	}
}

func (s *classService) CreateClass(name, description string) (*domain.Class, error) {
	if name == "" {
		return nil, errors.New("class name is required")
	}

	class := &domain.Class{
		Name:        name,
		Description: description,
	}

	err := s.classRepo.Create(class)
	if err != nil {
		return nil, err
	}

	return class, nil
}

func (s *classService) GetAllClasses() ([]domain.Class, error) {
	return s.classRepo.FindAll()
}

func (s *classService) GetClassByID(id uint) (*domain.Class, error) {
	return s.classRepo.FindByID(id)
}

func (s *classService) UpdateClass(id uint, name, description string) (*domain.Class, error) {
	class, err := s.classRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if class == nil {
		return nil, errors.New("class not found")
	}

	class.Name = name
	class.Description = description

	err = s.classRepo.Update(class)
	if err != nil {
		return nil, err
	}

	return class, nil
}

func (s *classService) DeleteClass(id uint) error {
	return s.classRepo.Delete(id)
}
