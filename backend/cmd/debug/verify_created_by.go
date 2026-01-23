package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load .env from backend root
	if err := godotenv.Load(".env"); err != nil {
		log.Println("Warning: Error loading .env file, trying default location or env vars")
		// Don't fatal, maybe env vars are set
	}

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Bangkok",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	// Check if column exists
	var exists bool
	db.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='created_by_id')").Scan(&exists)
	fmt.Printf("Column 'created_by_id' exists in 'questions': %v\n", exists)

	if !exists {
		log.Println("Column does not exist! AutoMigrate might have failed or not run.")
		return
	}

	// Check data stats
	var total int64
	var zero int64
	var nonZero int64

	db.Table("questions").Count(&total)
	db.Table("questions").Where("created_by_id = 0 OR created_by_id IS NULL").Count(&zero)
	db.Table("questions").Where("created_by_id > 0").Count(&nonZero)

	fmt.Printf("Total Questions: %d\n", total)
	fmt.Printf("Questions with CreatedBy=0 (Old/Missing): %d\n", zero)
	fmt.Printf("Questions with CreatedBy>0 (New/Correct): %d\n", nonZero)
}
