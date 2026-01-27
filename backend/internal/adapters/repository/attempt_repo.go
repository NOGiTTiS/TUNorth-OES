package repository

import (
	"errors"

	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
	"gorm.io/gorm"
)

type attemptRepo struct {
	db *gorm.DB
}

func NewAttemptRepository(db *gorm.DB) ports.IAttemptRepository {
	return &attemptRepo{db: db}
}

func (r *attemptRepo) Create(attempt *domain.ExamAttempt) error {
	return r.db.Create(attempt).Error
}

func (r *attemptRepo) Update(attempt *domain.ExamAttempt) error {
	return r.db.Save(attempt).Error
}

func (r *attemptRepo) FindByID(id uint) (*domain.ExamAttempt, error) {
	var attempt domain.ExamAttempt
	err := r.db.First(&attempt, id).Error
	return &attempt, err
}

func (r *attemptRepo) FindByUser(userID uint) ([]domain.ExamAttempt, error) {
	var attempts []domain.ExamAttempt
	// ดึงประวัติพร้อมข้อมูลข้อสอบ
	err := r.db.Preload("Exam").Preload("Exam.Subject").Where("user_id = ?", userID).Order("created_at desc").Find(&attempts).Error
	return attempts, err
}

func (r *attemptRepo) FindActiveAttempt(userID, examID uint) (*domain.ExamAttempt, error) {
	var attempt domain.ExamAttempt
	// ค้นหาการสอบที่ยังไม่ได้ Submit
	err := r.db.Where("user_id = ? AND exam_id = ? AND is_submitted = ?", userID, examID, false).First(&attempt).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &attempt, nil
}

func (r *attemptRepo) FindByExamID(examID uint) ([]domain.ExamAttempt, error) {
	var attempts []domain.ExamAttempt
	// Preload User เพื่อเอาชื่อนักเรียน
	err := r.db.Preload("User").Where("exam_id = ? AND is_submitted = ?", examID, true).Order("score desc").Find(&attempts).Error
	return attempts, err
}

func (r *attemptRepo) CountSubmitted() (int64, error) {
	var count int64
	err := r.db.Model(&domain.ExamAttempt{}).Where("is_submitted = ?", true).Count(&count).Error
	return count, err
}
