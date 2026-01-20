package repository

import (
	"fmt"
	"log"

	"github.com/nogittis/tunorth-oes-backend/internal/core/domain" // เปลี่ยน username เป็นของคุณ
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB Config struct เพื่อรับค่า config เข้ามา
type DBConfig struct {
	Host     string
	User     string
	Password string
	DBName   string
	Port     string
}

// NewPostgresDB ทำหน้าที่สร้าง Connection ไปยัง PostgreSQL
func NewPostgresDB(config DBConfig) (*gorm.DB, error) {
	// 1. สร้าง Data Source Name (DSN) ตามรูปแบบของ Postgres Driver
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Bangkok",
		config.Host,
		config.User,
		config.Password,
		config.DBName,
		config.Port,
	)

	// 2. เปิดการเชื่อมต่อ
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		// เปิด Logger เพื่อดู SQL Query ใน Console (เหมาะกับตอน Dev)
		Logger: logger.Default.LogMode(logger.Info),
	})
	

	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// 3. Auto Migrate: สั่งให้ GORM สร้างตารางให้อัตโนมัติถ้ายังไม่มี
	// เราจะใส่ Model User ที่เพิ่งสร้างเข้าไป
	log.Println("Running Auto Migration...")
    
    // --- แก้ไขตรงนี้ครับ ---
    err = db.AutoMigrate(
        &domain.User{},
        &domain.Subject{},
        &domain.Question{},
        &domain.Choice{},
        &domain.Exam{},
        &domain.ExamAttempt{},
        &domain.ExamAnswer{},
    )
	if err != nil {
		return nil, fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Database connection established and migrated successfully.")
	return db, nil
}
