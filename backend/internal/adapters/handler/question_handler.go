package handler

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
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
		SubjectID:  req.SubjectID,
		Content:    req.Content,
		ImageURL:   req.ImageURL,
		Type:       domain.MCQ,
		Difficulty: req.Difficulty,
		Choices:    choices,
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
	questions, err := h.service.GetQuestionsBySubjectID(uint(subjectID))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(questions)
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