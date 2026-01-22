package ports

import "github.com/nogittis/tunorth-oes-backend/internal/core/domain" // แก้ username ด้วยนะครับ

// IUserService คือสิ่งที่ Handler (Controller) เรียกใช้ได้
type IUserService interface {
    Register(user *domain.User) error
    Login(username, password string) (string, error) // คืนค่าเป็น JWT Token
    
    // Admin Features
	GetAllUsers() ([]domain.User, error)
	GetUserByID(id uint) (*domain.User, error)     // เพิ่ม: ดึงรายคน
	CreateUser(user *domain.User) error            // เพิ่ม: สร้าง (แบบ Admin)
	UpdateUser(id uint, user *domain.User) error   // เพิ่ม: แก้ไข
	DeleteUser(id uint) error

	CreateUsersBulk(users []domain.User) error
}

// IUserRepository คือสิ่งที่ Service เรียกใช้จาก Database
type IUserRepository interface {
	CreateUser(user *domain.User) error
    FindUserByUsername(username string) (*domain.User, error)
    
    // Admin Features
	FindAll() ([]domain.User, error)
	FindByID(id uint) (*domain.User, error) // อันนี้มีแล้ว (เช็คอีกที)
	Update(user *domain.User) error         // เพิ่ม: บันทึกการแก้ไข
	Delete(id uint) error

	CreateBulk(users []domain.User) error 
}