package repository

import (
	"errors"

	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
	"gorm.io/gorm"
)

// userRepo คือ struct ที่จะทำตามสัญญา IUserRepository
type userRepo struct {
	db *gorm.DB
}

// NewUserRepository สร้าง instance ของ userRepo
func NewUserRepository(db *gorm.DB) ports.IUserRepository {
	return &userRepo{
		db: db,
	}
}

// CreateUser บันทึกผู้ใช้ใหม่ลงฐานข้อมูล
func (r *userRepo) CreateUser(user *domain.User) error {
	// ใช้ GORM สั่ง Create
	result := r.db.Create(user)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

// FindUserByUsername ค้นหาผู้ใช้จากชื่อ Username
func (r *userRepo) FindUserByUsername(username string) (*domain.User, error) {
	var user domain.User
	// ค้นหา record แรกที่ username ตรงกัน
	result := r.db.Where("username = ?", username).First(&user)
	
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, result.Error
	}
	
	return &user, nil
}