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

func (r *userRepo) FindAll() ([]domain.User, error) {
	var users []domain.User
	// ดึงข้อมูลทั้งหมด ยกเว้น password (เพื่อความปลอดภัย)
	// Omit("Password") อาจจะไม่ทำงานถ้า field ใน struct ไม่ได้ตั้งเป็น pointer หรือ scanner
	// แต่ใน GORM v2 เราใช้ Smart Select หรือเลือกเฉพาะ field ได้
	// เอาแบบง่ายก่อนคือดึงมาหมด แล้ว JSON tag "-" ใน domain.User จะช่วยซ่อน password ให้เองครับ
	err := r.db.Order("created_at desc").Find(&users).Error
	return users, err
}

func (r *userRepo) Delete(id uint) error {
	// Hard Delete หรือ Soft Delete ขึ้นอยู่กับ GORM Model (ถ้ามี DeletedAt จะเป็น Soft Delete)
	return r.db.Delete(&domain.User{}, id).Error
}