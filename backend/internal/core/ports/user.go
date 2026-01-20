package ports

import "github.com/nogittis/tunorth-oes-backend/internal/core/domain" // แก้ username ด้วยนะครับ

// IUserService คือสิ่งที่ Handler (Controller) เรียกใช้ได้
type IUserService interface {
    Register(user *domain.User) error
    Login(username, password string) (string, error) // คืนค่าเป็น JWT Token
}

// IUserRepository คือสิ่งที่ Service เรียกใช้จาก Database
type IUserRepository interface {
    CreateUser(user *domain.User) error
    FindUserByUsername(username string) (*domain.User, error)
}