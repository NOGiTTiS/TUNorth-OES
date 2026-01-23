package domain

import (
	"gorm.io/gorm"
)

// SystemSetting defines the schema for system-wide configurations
type SystemSetting struct {
	gorm.Model

	// General
	SystemName        string `gorm:"type:varchar(255);default:'TUNorth-OES'" json:"system_name"`
	SystemDescription string `gorm:"type:text" json:"system_description"`
	Copyright         string `gorm:"type:varchar(255)" json:"copyright"`
	RegisterEnabled   bool   `gorm:"default:true" json:"register_enabled"`

	// Images
	LogoUrl    string `gorm:"type:text" json:"logo_url"`
	FaviconUrl string `gorm:"type:text" json:"favicon_url"`

	// Theme
	MainColor       string `gorm:"type:varchar(50);default:'#000000'" json:"main_color"`
	SecondColor     string `gorm:"type:varchar(50);default:'#ffffff'" json:"second_color"`
	BgGradientStart string `gorm:"type:varchar(50)" json:"bg_gradient_start"`
	BgGradientEnd   string `gorm:"type:varchar(50)" json:"bg_gradient_end"`
	Style           string `gorm:"type:varchar(50);default:'default'" json:"style"` // default, glassmorphism, neumorphism

	// Storage (Cloudinary)
	CloudinaryCloudName string `gorm:"type:varchar(255)" json:"cloudinary_cloud_name"`
	CloudinaryApiKey    string `gorm:"type:varchar(255)" json:"cloudinary_api_key"`
	CloudinaryApiSecret string `gorm:"type:varchar(255)" json:"cloudinary_api_secret"`

	// Access Control (Privacy)
	TeacherCanSeeAllExams    bool `gorm:"default:true" json:"teacher_can_see_all_exams"`   // true = Shared, false = Private
	TeacherShareQuestionBank bool `gorm:"default:true" json:"teacher_share_question_bank"` // true = Shared, false = Private
}

func (SystemSetting) TableName() string {
	return "system_settings"
}
