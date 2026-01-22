package main

import (
	"fmt"
	"log"
	"os"

	jwtware "github.com/gofiber/contrib/jwt"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"

	// 1. Import Scalar
	scalar "github.com/yokeTH/gofiber-scalar"

	// Import packages ของเรา
	"github.com/nogittis/tunorth-oes-backend/internal/adapters/gateway"
	"github.com/nogittis/tunorth-oes-backend/internal/adapters/handler"
	"github.com/nogittis/tunorth-oes-backend/internal/adapters/repository"
	"github.com/nogittis/tunorth-oes-backend/internal/core/services"

	_ "github.com/nogittis/tunorth-oes-backend/docs"
)

// @title           TUNorth-OES API
// @version         1.0
// @description     API สำหรับระบบจัดสอบออนไลน์ โรงเรียนเตรียมอุดมศึกษา ภาคเหนือ
// @contact.name    API Support
// @contact.email   support@tunorth.ac.th
// @host            localhost:8880
// @BasePath        /api
// @schemes         http

func main() {
	// 1. Setup Config
	err := godotenv.Load("../../../.env")
	if err != nil {
		err = godotenv.Load(".env")
		if err != nil {
			log.Println("Warning: .env file not found")
		}
	}

	// 2. Setup Database
	dbConfig := repository.DBConfig{
		Host:     os.Getenv("DB_HOST"),
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
		DBName:   os.Getenv("DB_NAME"),
		Port:     os.Getenv("DB_PORT"),
	}

	db, err := repository.NewPostgresDB(dbConfig)
	if err != nil {
		log.Fatalf("Could not connect to database: %v", err)
	}

	// 3. Dependency Injection
	// User Dependency
	userRepo := repository.NewUserRepository(db)
	userService := services.NewUserService(userRepo, os.Getenv("JWT_SECRET"))
	userHandler := handler.NewUserHandler(userService)

	// Subject Dependency
	subjectRepo := repository.NewSubjectRepository(db)
	subjectService := services.NewSubjectService(subjectRepo)
	subjectHandler := handler.NewSubjectHandler(subjectService)

	// Question Dependency
	questionRepo := repository.NewQuestionRepository(db)
	questionService := services.NewQuestionService(questionRepo)
	questionHandler := handler.NewQuestionHandler(questionService)

	// Exam Dependency
	examRepo := repository.NewExamRepository(db)
	examService := services.NewExamService(examRepo)
	examHandler := handler.NewExamHandler(examService)

	// Attempt Dependency
    attemptRepo := repository.NewAttemptRepository(db)
    // สังเกตว่าเราส่ง examRepo เข้าไปด้วย เพื่อให้ Service ไปดึงเฉลยมาตรวจได้
    attemptService := services.NewAttemptService(attemptRepo, examRepo) 
    attemptHandler := handler.NewAttemptHandler(attemptService)

	// Cloudinary
    cloudService, _ := gateway.NewCloudinaryService() // Error handling จริงๆ ควรทำดีกว่านี้
    uploadHandler := handler.NewUploadHandler(cloudService)

	// Setup Fiber App
	app := fiber.New(fiber.Config{
		AppName: "TUNorth-OES Backend v1.0",
	})

	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// 1. ให้ Server จ่ายไฟล์ swagger.json ออกมาตรงๆ
	// เมื่อเข้า http://localhost:8880/docs/swagger.json จะต้องได้ไฟล์ JSON
	app.Static("/docs", "./docs")

	// 2. สร้างหน้าเว็บ Scalar Documentation
	app.Get("/reference", scalar.New(scalar.Config{
		Title:      "TUNorth-OES API Docs",
		RawSpecUrl: "/docs/swagger.json", // บอก Scalar ว่าไฟล์ข้อมูลอยู่ที่ไหน
		Path:       "reference",          // ต้องตรงกับ Path ที่กำหนดใน app.Get
		// Theme และ ShowSidebar ไม่รองรับในเวอร์ชันนี้
	}))

	jwtMiddleware := jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{Key: []byte(os.Getenv("JWT_SECRET"))},
		// ถ้า Token ไม่ผ่าน ให้ตอบกลับแบบนี้
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Unauthorized or Token Expired",
			})
		},
	})

	// 5. Setup Routes (API)
	api := app.Group("/api")

	// Auth Routes
	auth := api.Group("/auth")
	auth.Post("/register", userHandler.Register) // POST /api/auth/register
	auth.Post("/login", userHandler.Login)       // POST /api/auth/login

	// Subject Routes
	subjects := api.Group("/subjects")
	subjects.Use(jwtMiddleware)
	subjects.Get("/", subjectHandler.GetAllSubjects)
	subjects.Get("/:id", subjectHandler.GetSubjectByID)
	subjects.Post("/", subjectHandler.CreateSubject) // ในอนาคตควรใส่ Middleware เช็ค Admin
	subjects.Put("/:id", subjectHandler.UpdateSubject)
	subjects.Delete("/:id", subjectHandler.DeleteSubject)

	// Question Routes
	questions := api.Group("/questions")
	questions.Use(jwtMiddleware)
	questions.Post("/", questionHandler.CreateQuestion)
	questions.Get("/subject/:subjectId", questionHandler.GetQuestionsBySubject)
	questions.Delete("/:id", questionHandler.DeleteQuestion)

	// Exam Routes
    exams := api.Group("/exams")
    exams.Use(jwtMiddleware)
    exams.Post("/", examHandler.CreateExam) 
    exams.Get("/", examHandler.GetAllExams)
    exams.Get("/:id", examHandler.GetExamByID)

	// Attempt Routes
    attempts := api.Group("/attempts")
    attempts.Use(jwtMiddleware)
	attempts.Post("/start", attemptHandler.StartExam)
    attempts.Post("/submit", attemptHandler.SubmitExam)
    attempts.Get("/history", attemptHandler.GetHistory)
	attempts.Get("/exam/:examId", attemptHandler.GetExamResults)

	// User Routes
	users := api.Group("/users")
	users.Use(jwtMiddleware) // ต้อง Login ก่อน
	users.Get("/", userHandler.GetAllUsers)
	users.Delete("/:id", userHandler.DeleteUser)

	// Upload Route (ต้อง Login)
    api.Post("/upload", jwtMiddleware, uploadHandler.UploadImage)

	// Test Route
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "success",
			"message": "Welcome to TUNorth-OES API",
		})
	})

	// 6. Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8880"
	}

	fmt.Printf("Server is running on port %s\n", port)
	log.Fatal(app.Listen(":" + port))
}
