package domain

import (
	"gorm.io/gorm"
)

// Class represents a student class/group (e.g., "6.1", "6.2")
type Class struct {
	gorm.Model
	Name        string `gorm:"uniqueIndex;not null;type:varchar(20)" json:"name" example:"6.1"`
	Description string `gorm:"type:varchar(255)" json:"description"`
	// Relation: A class has many students
	Students    []User `gorm:"foreignKey:ClassID" json:"students,omitempty"`
}

func (Class) TableName() string {
	return "classes"
}
