package handler

import (
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
)

type ExamHandler struct {
	service ports.IExamService
}

func NewExamHandler(service ports.IExamService) *ExamHandler {
	return &ExamHandler{service: service}
}

// DTO สำหรับรับข้อมูล
type CreateExamRequest struct {
	SubjectID   uint      `json:"subject_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Duration    int       `json:"duration"` // นาที
	StartTime   string    `json:"start_time" example:"2026-03-01T09:00:00+07:00"` // รับเป็น String ISO8601
	EndTime     string    `json:"end_time" example:"2026-03-01T12:00:00+07:00"`
	QuestionIDs []uint    `json:"question_ids"` // รายการ ID ข้อสอบที่จะเอามาใส่
	TargetClasses []string `json:"target_classes"`
	IsRandom      bool     `json:"is_random"`
	ShowScore     bool     `json:"show_score"`
}

// CreateExam godoc
// @Summary      สร้างชุดข้อสอบ
// @Tags         Exams
// @Accept       json
// @Produce      json
// @Param        request body CreateExamRequest true "ข้อมูลชุดข้อสอบ"
// @Security     ApiKeyAuth
// @Success      201  {object} domain.Exam
// @Failure      400  {object} map[string]interface{}
// @Router       /exams [post]
func (h *ExamHandler) CreateExam(c *fiber.Ctx) error {
	req := new(CreateExamRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	// แปลงเวลาจาก String เป็น time.Time
	startTime, err := time.Parse(time.RFC3339, req.StartTime)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid start_time format (RFC3339)"})
	}
	endTime, err := time.Parse(time.RFC3339, req.EndTime)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid end_time format (RFC3339)"})
	}

	exam := domain.Exam{
		SubjectID:   req.SubjectID,
		Title:       req.Title,
		Description: req.Description,
		Duration:    req.Duration,
		StartTime:   startTime,
		EndTime:     endTime,
		TargetClasses: req.TargetClasses,
		IsRandom:      req.IsRandom,
		ShowScore:     req.ShowScore,
	}

	if err := h.service.CreateExam(&exam, req.QuestionIDs); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(exam)
}

// GetAllExams godoc
// @Summary      ดูรายการชุดข้อสอบทั้งหมด
// @Tags         Exams
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200  {array} domain.Exam
// @Router       /exams [get]

// 3. อัปเดต GetAllExams (หัวใจสำคัญ!)
func (h *ExamHandler) GetAllExams(c *fiber.Ctx) error {
    // ดึง User จาก Token
    userToken := c.Locals("user").(*jwt.Token)
    claims := userToken.Claims.(jwt.MapClaims)
    role := claims["role"].(string)

	if role == "teacher" || role == "admin" {
		exams, err := h.service.GetAllExams()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(exams)
	}

	// กรณีนักเรียน
	userID := uint(claims["user_id"].(float64))
	
	// เรียกใช้ฟังก์ชันที่เราเพิ่งสร้าง (Error "undefined" จะหายไป)
	exams, err := h.service.GetExamsForStudent(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(exams)
}

// UpdateExam godoc
// @Summary      แก้ไขชุดข้อสอบ
// @Tags         Exams
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "Exam ID"
// @Param        request body CreateExamRequest true "ข้อมูลชุดข้อสอบ"
// @Security     ApiKeyAuth
// @Success      200  {object} map[string]interface{}
// @Router       /exams/{id} [put]
func (h *ExamHandler) UpdateExam(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	req := new(CreateExamRequest)
	
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	// แปลงเวลา (เหมือน Create)
	startTime, err := time.Parse(time.RFC3339, req.StartTime)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid start_time"})
	}
	endTime, err := time.Parse(time.RFC3339, req.EndTime)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid end_time"})
	}

	exam := domain.Exam{
		SubjectID:     req.SubjectID,
		Title:         req.Title,
		Description:   req.Description,
		Duration:      req.Duration,
		StartTime:     startTime,
		EndTime:       endTime,
		TargetClasses: req.TargetClasses,
		IsRandom:      req.IsRandom,
		ShowScore:     req.ShowScore,
	}

	if err := h.service.UpdateExam(uint(id), &exam, req.QuestionIDs); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Exam updated successfully"})
}

// DeleteExam godoc
// @Summary      ลบชุดข้อสอบ
// @Tags         Exams
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Exam ID"
// @Success      200  {object} map[string]interface{}
// @Router       /exams/{id} [delete]
func (h *ExamHandler) DeleteExam(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	
	// เรียกใช้ Service (Error "declared and not used" จะหายไป)
	if err := h.service.DeleteExam(uint(id)); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	
	return c.JSON(fiber.Map{"message": "Exam deleted successfully"})
}

// GetExamByID godoc
// @Summary      ดูรายละเอียดชุดข้อสอบ (รวมถึงตัวโจทย์)
// @Tags         Exams
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "Exam ID"
// @Security     ApiKeyAuth
// @Success      200  {object} domain.Exam
// @Router       /exams/{id} [get]
func (h *ExamHandler) GetExamByID(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	exam, err := h.service.GetExamByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Exam not found"})
	}
	return c.JSON(exam)
}