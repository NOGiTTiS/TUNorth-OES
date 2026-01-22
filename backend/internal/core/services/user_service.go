package services

import (
    "errors"
    "time"

    "github.com/golang-jwt/jwt/v5"
    "github.com/nogittis/tunorth-oes-backend/internal/core/domain"
    "github.com/nogittis/tunorth-oes-backend/internal/core/ports"
    "golang.org/x/crypto/bcrypt"
)

type userService struct {
    userRepo  ports.IUserRepository
    jwtSecret string
}

// NewUserService คือฟังก์ชันสร้าง Service นี้ขึ้นมา
func NewUserService(repo ports.IUserRepository, secret string) ports.IUserService {
    return &userService{
        userRepo:  repo,
        jwtSecret: secret,
    }
}

// Register: สมัครสมาชิก
func (s *userService) Register(user *domain.User) error {
    // 1. ตรวจสอบว่ามี username นี้หรือยัง (Optional: ขึ้นกับว่า Repo error หรือเปล่า แต่เช็คก่อนก็ดี)
    existingUser, _ := s.userRepo.FindUserByUsername(user.Username)
    if existingUser != nil {
        return errors.New("username already exists")
    }

    // 2. Hash Password (แปลงรหัสผ่านเป็นภาษาต่างดาว เพื่อความปลอดภัย)
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
    if err != nil {
        return err
    }
    user.Password = string(hashedPassword)

    // 3. บันทึกลง Database
    return s.userRepo.CreateUser(user)
}

// Login: เข้าสู่ระบบ
func (s *userService) Login(username, password string) (string, error) {
    // 1. ค้นหา user จาก database
    user, err := s.userRepo.FindUserByUsername(username)
    if err != nil {
        return "", errors.New("invalid username or password")
    }

    // 2. ตรวจสอบรหัสผ่าน (เอาที่กรอกมา เทียบกับ Hash ใน DB)
    err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
    if err != nil {
        return "", errors.New("invalid username or password")
    }

    // 3. สร้าง JWT Token (บัตรผ่าน)
    token := jwt.New(jwt.SigningMethodHS256)
    claims := token.Claims.(jwt.MapClaims)
    claims["user_id"] = user.ID
    claims["username"] = user.Username
    claims["role"] = user.Role
    claims["exp"] = time.Now().Add(time.Hour * 24).Unix() // หมดอายุใน 24 ชม.

    t, err := token.SignedString([]byte(s.jwtSecret))
    if err != nil {
        return "", err
    }

    return t, nil
}

func (s *userService) GetAllUsers() ([]domain.User, error) {
	return s.userRepo.FindAll()
}

func (s *userService) DeleteUser(id uint) error {
	return s.userRepo.Delete(id)
}

// เพิ่มฟังก์ชัน GetUserByID
func (s *userService) GetUserByID(id uint) (*domain.User, error) {
	return s.userRepo.FindByID(id)
}

// เพิ่มฟังก์ชัน CreateUser (คล้าย Register แต่ Admin เป็นคนทำ)
func (s *userService) CreateUser(user *domain.User) error {
	// Hash Password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hashedPassword)
	
	return s.userRepo.CreateUser(user)
}

// เพิ่มฟังก์ชัน UpdateUser
func (s *userService) UpdateUser(id uint, input *domain.User) error {
	// 1. หา User เดิมก่อน
	existingUser, err := s.userRepo.FindByID(id)
	if err != nil {
		return err
	}

	// 2. อัปเดตข้อมูล (เฉพาะที่มีการส่งมา)
	existingUser.FirstName = input.FirstName
	existingUser.LastName = input.LastName
	existingUser.Role = input.Role
	existingUser.ClassRoom = input.ClassRoom // เพิ่มเรื่องห้องเรียน

	// 3. ถ้ามีการส่ง Password มาใหม่ ให้ Hash ใหม่ (ถ้าส่งมาเป็นว่างๆ คือไม่เปลี่ยน)
	if input.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		existingUser.Password = string(hashedPassword)
	}

	// 4. บันทึก
	return s.userRepo.Update(existingUser)
}