package ports

import "github.com/nogittis/tunorth-oes-backend/internal/core/domain"

// ClassRepository defines the interface for class persistence
type ClassRepository interface {
	Create(class *domain.Class) error
	FindAll() ([]domain.Class, error)
	FindByID(id uint) (*domain.Class, error)
	FindByName(name string) (*domain.Class, error)
	Update(class *domain.Class) error
	Delete(id uint) error
}

// ClassService defines the interface for class business logic
type ClassService interface {
	CreateClass(name, description string) (*domain.Class, error)
	GetAllClasses() ([]domain.Class, error)
	GetClassByID(id uint) (*domain.Class, error)
	GetClassByName(name string) (*domain.Class, error)
	UpdateClass(id uint, name, description string) (*domain.Class, error)
	DeleteClass(id uint) error
}
