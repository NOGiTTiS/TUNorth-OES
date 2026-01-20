package repository

import (
	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
	"gorm.io/gorm"
)

type questionRepo struct {
	db *gorm.DB
}

func NewQuestionRepository(db *gorm.DB) ports.IQuestionRepository {
	return &questionRepo{db: db}
}

func (r *questionRepo) Create(question *domain.Question) error {
	// GORM ฉลาดพอที่จะสร้างทั้ง Question และ Choices ที่ผูกติดมาด้วยใน Transaction เดียว
	return r.db.Create(question).Error
}

func (r *questionRepo) FindBySubjectID(subjectID uint) ([]domain.Question, error) {
	var questions []domain.Question
	// Preload("Choices") คือสั่งให้ดึงตัวเลือกติดมาด้วย
	err := r.db.Preload("Choices").Where("subject_id = ?", subjectID).Find(&questions).Error
	return questions, err
}

func (r *questionRepo) Delete(id uint) error {
	// เนื่องจากเราตั้ง OnDelete: CASCADE ไว้ใน Model
	// การลบ Question จะลบ Choices ให้อัตโนมัติในระดับ Database (ถ้า DB รองรับ)
	// หรือ GORM จะช่วยลบให้
	return r.db.Delete(&domain.Question{}, id).Error
}