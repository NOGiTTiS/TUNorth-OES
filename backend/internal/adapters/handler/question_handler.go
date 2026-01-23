package handler

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
)

type QuestionHandler struct {
	service ports.IQuestionService
}

func NewQuestionHandler(service ports.IQuestionService) *QuestionHandler {
	return &QuestionHandler{service: service}
}

// DTO สำหรับรับข้อมูล
type ChoiceRequest struct {
	Content   string `json:"content"`
	ImageURL  string `json:"image_url"`
	IsCorrect bool   `json:"is_correct"`
}

type CreateQuestionRequest struct {
	SubjectID  uint            `json:"subject_id"`
	Content    string          `json:"content"`
	ImageURL   string          `json:"image_url"`
	Difficulty int             `json:"difficulty"`
	Choices    []ChoiceRequest `json:"choices"`
}

type BulkCreateQuestionRequest struct {
	SubjectID uint                    `json:"subject_id"`
	Questions []CreateQuestionRequest `json:"questions"` // ใช้ struct เดิมมาเป็น array
}

// CreateQuestion godoc
// @Summary      สร้างข้อสอบใหม่
// @Description  สร้างโจทย์พร้อมตัวเลือก
// @Tags         Questions
// @Accept       json
// @Produce      json
// @Param        request body CreateQuestionRequest true "ข้อมูลโจทย์และตัวเลือก"
// @Security     ApiKeyAuth
// @Success      201  {object} domain.Question
// @Failure      400  {object} map[string]interface{}
// @Router       /questions [post]
func (h *QuestionHandler) CreateQuestion(c *fiber.Ctx) error {
	req := new(CreateQuestionRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	// 1. Extract UserID
	userToken := c.Locals("user").(*jwt.Token)
	claims := userToken.Claims.(jwt.MapClaims)
	userID := uint(claims["user_id"].(float64))

	// แปลง Request DTO เป็น Domain Model
	choices := make([]domain.Choice, len(req.Choices))
	for i, ch := range req.Choices {
		choices[i] = domain.Choice{
			Content:   ch.Content,
			ImageURL:  ch.ImageURL,
			IsCorrect: ch.IsCorrect,
		}
	}

	question := domain.Question{
		SubjectID:   req.SubjectID,
		Content:     req.Content,
		ImageURL:    req.ImageURL,
		Type:        domain.MCQ,
		Difficulty:  req.Difficulty,
		Choices:     choices,
		CreatedByID: userID,
	}

	if err := h.service.CreateQuestion(&question); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(question)
}

// GetQuestionsBySubject godoc
// @Summary      ดึงข้อสอบตามวิชา
// @Tags         Questions
// @Accept       json
// @Produce      json
// @Param        subjectId   path      int  true  "Subject ID"
// @Security     ApiKeyAuth
// @Success      200  {array} domain.Question
// @Router       /questions/subject/{subjectId} [get]
func (h *QuestionHandler) GetQuestionsBySubject(c *fiber.Ctx) error {
	subjectID, _ := strconv.Atoi(c.Params("subjectId"))

	// 1. Extract User Info
	userToken := c.Locals("user").(*jwt.Token)
	claims := userToken.Claims.(jwt.MapClaims)
	role := claims["role"].(string)
	userID := uint(claims["user_id"].(float64))

	// 2. Pass to Service
	questions, err := h.service.GetQuestionsBySubjectID(uint(subjectID), userID, role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(questions)
}

// UpdateQuestion godoc
// @Summary      แก้ไขข้อสอบ
// @Tags         Questions
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "Question ID"
// @Param        request body CreateQuestionRequest true "ข้อมูลข้อสอบใหม่"
// @Security     ApiKeyAuth
// @Success      200  {object} map[string]interface{}
// @Router       /questions/{id} [put]
func (h *QuestionHandler) UpdateQuestion(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	req := new(CreateQuestionRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	// แปลง DTO เป็น Domain
	choices := make([]domain.Choice, len(req.Choices))
	for i, ch := range req.Choices {
		choices[i] = domain.Choice{
			Content:   ch.Content,
			ImageURL:  ch.ImageURL,
			IsCorrect: ch.IsCorrect,
		}
	}

	question := domain.Question{
		SubjectID:  req.SubjectID,
		Content:    req.Content,
		ImageURL:   req.ImageURL,
		Difficulty: req.Difficulty,
		Choices:    choices,
	}

	if err := h.service.UpdateQuestion(uint(id), &question); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Question updated successfully"})
}

// DeleteQuestion godoc
// @Summary      ลบข้อสอบ
// @Tags         Questions
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "Question ID"
// @Security     ApiKeyAuth
// @Success      200  {object} map[string]interface{}
// @Router       /questions/{id} [delete]
func (h *QuestionHandler) DeleteQuestion(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	if err := h.service.DeleteQuestion(uint(id)); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Question deleted successfully"})
}

// BulkCreateQuestions godoc
// @Summary      นำเข้าข้อสอบหลายข้อ (Excel Import)
// @Tags         Questions
// @Accept       json
// @Produce      json
// @Param        request body BulkCreateQuestionRequest true "ข้อมูลข้อสอบหลายข้อ"
// @Security     ApiKeyAuth
// @Success      201  {object} map[string]interface{}
// @Router       /questions/bulk [post]
func (h *QuestionHandler) BulkCreateQuestions(c *fiber.Ctx) error {
	req := new(BulkCreateQuestionRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	// 1. Extract UserID
	userToken := c.Locals("user").(*jwt.Token)
	claims := userToken.Claims.(jwt.MapClaims)
	userID := uint(claims["user_id"].(float64))

	var questions []domain.Question
	for _, qReq := range req.Questions {
		// แปลง DTO เป็น Domain
		choices := make([]domain.Choice, len(qReq.Choices))
		for i, ch := range qReq.Choices {
			choices[i] = domain.Choice{
				Content:   ch.Content,
				ImageURL:  ch.ImageURL,
				IsCorrect: ch.IsCorrect,
			}
		}

		questions = append(questions, domain.Question{
			SubjectID:   req.SubjectID, // ใช้ Subject ID เดียวกันหมด
			Content:     qReq.Content,
			ImageURL:    qReq.ImageURL,
			Type:        domain.MCQ,
			Difficulty:  qReq.Difficulty,
			Choices:     choices,
			CreatedByID: userID,
		})
	}

	if err := h.service.CreateQuestionsBulk(questions); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Imported successfully",
		"count":   len(questions),
	})
}
