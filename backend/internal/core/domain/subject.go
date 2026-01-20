package domain

import "gorm.io/gorm"

type Subject struct {
	gorm.Model
	Code        string `gorm:"uniqueIndex;not null;type:varchar(20)" json:"code" example:"MAT101"` // รหัสวิชา (ห้ามซ้ำ)
	Name        string `gorm:"not null;type:varchar(100)" json:"name" example:"Mathematics"`       // ชื่อวิชา
	Description string `gorm:"type:text" json:"description" example:"วิชาคณิตศาสตร์พื้นฐาน"`           // คำอธิบาย
	IsActive    bool   `gorm:"default:true" json:"is_active" example:"true"`                       // เปิดใช้งานหรือไม่
}