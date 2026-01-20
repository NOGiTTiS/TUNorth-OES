package handler

import (
	"strconv"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gofiber/fiber/v2"
	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
)

var _ = domain.ExamAttempt{} 

type AttemptHandler struct {
	service ports.IAttemptService
}

func NewAttemptHandler(service ports.IAttemptService) *AttemptHandler {
	return &AttemptHandler{service: service}
}

// Helper: ดึง UserID จาก Token
func getUserID(c *fiber.Ctx) uint {
	userToken := c.Locals("user").(*jwt.Token)
    
    // แปลง claims
    claims := userToken.Claims.(jwt.MapClaims)
    
    // ดึง user_id (ตอนสร้าง token เราตั้งชื่อ key ว่า "user_id")
    // ค่าที่ได้จาก JSON มักจะเป็น float64 เลยต้องแปลง 2 ต่อ
    return uint(claims["user_id"].(float64))
}

// StartExam godoc
// @Summary      เริ่มทำข้อสอบ
// @Tags         Attempts
// @Accept       json
// @Produce      json
// @Param        exam_id body object{exam_id=int} true "Exam ID"
// @Security     ApiKeyAuth
// @Success      201  {object} map[string]interface{}
// @Router       /attempts/start [post]
func (h *AttemptHandler) StartExam(c *fiber.Ctx) error {
	type Request struct {
		ExamID uint `json:"exam_id"`
	}
	req := new(Request)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	userID := getUserID(c)
	attempt, err := h.service.StartExam(userID, req.ExamID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(attempt)
}

// SubmitExam godoc
// @Summary      ส่งคำตอบ
// @Tags         Attempts
// @Accept       json
// @Produce      json
// @Param        request body object{attempt_id=int, answers=[]ports.SubmitAnswerRequest} true "คำตอบ"
// @Security     ApiKeyAuth
// @Success      200  {object} map[string]interface{}
// @Router       /attempts/submit [post]
func (h *AttemptHandler) SubmitExam(c *fiber.Ctx) error {
	type Request struct {
		AttemptID uint                        `json:"attempt_id"`
		Answers   []ports.SubmitAnswerRequest `json:"answers"`
	}
	req := new(Request)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	// จริงๆ ควรเช็คด้วยว่า Attempt นี้เป็นของ User นี้จริงๆ ไหม (เพื่อความปลอดภัย)
	
	result, err := h.service.SubmitExam(req.AttemptID, req.Answers)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message":   "Exam submitted successfully",
		"score":     result.Score,
		"max_score": result.MaxScore,
	})
}

// GetHistory godoc
// @Summary      ดูประวัติการสอบของฉัน
// @Tags         Attempts
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200  {array} domain.ExamAttempt
// @Router       /attempts/history [get]
func (h *AttemptHandler) GetHistory(c *fiber.Ctx) error {
	userID := getUserID(c)
	history, err := h.service.GetStudentHistory(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(history)
}

// GetExamResults godoc
// @Summary      ดูคะแนนสอบรายบุคคล (สำหรับครู)
// @Tags         Reports
// @Param        examId   path      int  true  "Exam ID"
// @Security     ApiKeyAuth
// @Router       /attempts/exam/{examId} [get]
func (h *AttemptHandler) GetExamResults(c *fiber.Ctx) error {
    examID, _ := strconv.Atoi(c.Params("examId"))
    // TODO: ควรเช็ค Role ว่าเป็น Teacher/Admin หรือไม่
    results, err := h.service.GetExamResults(uint(examID))
    if err != nil {
         return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    return c.JSON(results)
}