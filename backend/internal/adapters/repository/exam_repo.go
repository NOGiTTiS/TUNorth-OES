package repository

import (
	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
	"gorm.io/gorm"
)

type examRepo struct {
	db *gorm.DB
}

func NewExamRepository(db *gorm.DB) ports.IExamRepository {
	return &examRepo{db: db}
}

func (r *examRepo) Create(exam *domain.Exam) error {
	return r.db.Create(exam).Error
}

func (r *examRepo) FindAll(creatorID uint) ([]domain.Exam, error) {
	var exams []domain.Exam

	db := r.db.Preload("Subject").Preload("Questions").Preload("TargetClasses").Order("created_at desc")

	// Private mode: Filter by creatorID OR legacy exams (created_by_id = 0)
	if creatorID > 0 {
		db = db.Where("created_by_id = ? OR created_by_id = 0 OR created_by_id IS NULL", creatorID)
	}

	err := db.Find(&exams).Error
	return exams, err
}

func (r *examRepo) FindByID(id uint) (*domain.Exam, error) {
	var exam domain.Exam
	// Preload ทั้ง Subject และ Questions (พร้อม Choices)
	err := r.db.Preload("Subject").
		Preload("Questions").
		Preload("Questions.Choices").
		Preload("TargetClasses").
		First(&exam, id).Error
	return &exam, err
}

func (r *examRepo) AddQuestions(examID uint, questionIDs []uint) error {
	// ใช้ Association Mode ของ GORM จัดการ Many-to-Many
	var exam domain.Exam
	exam.ID = examID

	// สร้าง Slice ของ Question struct เพื่อส่งให้ GORM
	var questions []domain.Question
	for _, qID := range questionIDs {
		questions = append(questions, domain.Question{Model: gorm.Model{ID: qID}})
	}

	return r.db.Model(&exam).Association("Questions").Append(questions)
}

// เพิ่มฟังก์ชันหาข้อสอบตามห้อง
func (r *examRepo) FindByClass(classID uint) ([]domain.Exam, error) {
	var exams []domain.Exam
	// Join with the many-to-many table (exam_target_classes is the default GORM name for Exam <-> Class)
	err := r.db.Preload("Subject").
		Preload("Questions").
		Preload("TargetClasses").
		Joins("JOIN exam_target_classes ON exam_target_classes.exam_id = exams.id").
		Where("exam_target_classes.class_id = ?", classID).
		Order("exams.created_at desc").
		Find(&exams).Error
	return exams, err
}

func (r *examRepo) Update(exam *domain.Exam, questionIDs []uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {

		// 1. แก้ไขส่วนนี้: เปลี่ยนจาก Updates(exam) เป็น map
		if err := tx.Model(exam).Updates(map[string]interface{}{
			"title":       exam.Title,
			"description": exam.Description,
			"subject_id":  exam.SubjectID,
			"duration":    exam.Duration,
			"start_time":  exam.StartTime,
			"end_time":    exam.EndTime,
			// "target_classes": handled via association below
			"is_random":  exam.IsRandom,
			"show_score": exam.ShowScore,
		}).Error; err != nil {
			return err
		}

		// 2. อัปเดต Classes (Many-to-Many)
		if err := tx.Model(exam).Association("TargetClasses").Replace(exam.TargetClasses); err != nil {
			return err
		}

		// 3. อัปเดตรายการข้อสอบ (ส่วนนี้เหมือนเดิม)
		var questions []domain.Question
		for _, qID := range questionIDs {
			questions = append(questions, domain.Question{Model: gorm.Model{ID: qID}})
		}

		if err := tx.Model(exam).Association("Questions").Replace(questions); err != nil {
			return err
		}

		return nil
	})
}

func (r *examRepo) Delete(id uint) error {
	// ลบ Exam (Cascade จะลบ ExamQuestions ให้เองถ้าตั้งไว้ หรือ GORM จัดการให้)
	return r.db.Delete(&domain.Exam{}, id).Error
}
