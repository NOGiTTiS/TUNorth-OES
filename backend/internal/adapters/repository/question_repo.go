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
	err := r.db.Preload("Choices").Where("subject_id = ?", subjectID).Find(&questions).Error
	return questions, err
}

func (r *questionRepo) FindBySubjectIDAndCreator(subjectID uint, creatorID uint) ([]domain.Question, error) {
	var questions []domain.Question
	// Filter by SubjectID AND CreatedByID
	// Note: CreatedByID might not exist in Question struct if we didn't add it explicitly?
	// Let's check Domain. Usually GORM adds CreatedAt, UpdatedAt, DeletedAt.
	// But CreatedBy (User) needs to be defined.
	// Assume it exists or I should add it?
	// Wait, standard gorm.Model doesn't have CreatedByID.
	// If domain.Question doesn't have CreatedByID, we can't filter.
	// Let's check domain/question.go first.
	// If it's missing, I'll need to add it.
	// For now, I will write the query assuming it exists, and I will verify domain next.
	err := r.db.Preload("Choices").Where("subject_id = ? AND created_by_id = ?", subjectID, creatorID).Find(&questions).Error
	return questions, err
}

func (r *questionRepo) Update(id uint, question *domain.Question) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// 1. อัปเดตข้อมูลโจทย์
		if err := tx.Model(&domain.Question{}).Where("id = ?", id).Updates(map[string]interface{}{
			"content":    question.Content,
			"image_url":  question.ImageURL,
			"difficulty": question.Difficulty,
		}).Error; err != nil {
			return err
		}

		// 2. ลบตัวเลือกเก่าทั้งหมดทิ้ง (Simple Strategy)
		if err := tx.Where("question_id = ?", id).Delete(&domain.Choice{}).Error; err != nil {
			return err
		}

		// 3. สร้างตัวเลือกใหม่
		for _, c := range question.Choices {
			c.QuestionID = id
			if err := tx.Create(&c).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *questionRepo) Delete(id uint) error {
	// เนื่องจากเราตั้ง OnDelete: CASCADE ไว้ใน Model
	// การลบ Question จะลบ Choices ให้อัตโนมัติในระดับ Database (ถ้า DB รองรับ)
	// หรือ GORM จะช่วยลบให้
	return r.db.Delete(&domain.Question{}, id).Error
}

func (r *questionRepo) CreateBulk(questions []domain.Question) error {
	// Batch Insert: GORM จะจัดการ Insert ทีละหลาย row ให้เอง ประสิทธิภาพสูง
	return r.db.Create(&questions).Error
}
