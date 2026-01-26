package domain

import (
	"gorm.io/gorm"
)

// UserRole กำหนดประเภทของผู้ใช้
type UserRole string

const (
	RoleAdmin   UserRole = "admin"
	RoleTeacher UserRole = "teacher"
	RoleStudent UserRole = "student"
)

// User คือโครงสร้างข้อมูลผู้ใช้ที่จะถูกนำไปสร้างเป็นตารางใน Database
type User struct {
	// gorm.Model จะให้ field พื้นฐานมาอัตโนมัติ: ID, CreatedAt, UpdatedAt, DeletedAt
	gorm.Model

	Username  string   `gorm:"uniqueIndex;not null;type:varchar(50)" json:"username"` // ชื่อผู้ใช้ห้ามซ้ำ
	Password  string   `gorm:"not null" json:"-"`                                     // รหัสผ่าน (เก็บแบบ Hash) json:"-" คือไม่ส่งกลับไปหน้าบ้าน
	FirstName string   `gorm:"type:varchar(100)" json:"first_name"`
	LastName  string   `gorm:"type:varchar(100)" json:"last_name"`
	Role      UserRole `gorm:"type:varchar(20);default:'student'" json:"role"` // admin, teacher, student

	// Relation: User belongs to one Class (Homeroom)
	ClassID *uint  `json:"class_id"`
	Class   *Class `gorm:"foreignKey:ClassID" json:"class,omitempty"`

	IsActive bool `gorm:"default:true" json:"is_active"`

	// ข้อมูลเพิ่มเติม
	Email string `gorm:"type:varchar(100)" json:"email"`
	Phone string `gorm:"type:varchar(20)" json:"phone"`
}

// TableName กำหนดชื่อตารางให้ชัดเจน (Optional แต่แนะนำ)
func (User) TableName() string {
	return "users"
}
