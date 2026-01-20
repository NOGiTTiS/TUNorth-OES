package handler

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
)

type SubjectHandler struct {
	service ports.ISubjectService
}

func NewSubjectHandler(service ports.ISubjectService) *SubjectHandler {
	return &SubjectHandler{service: service}
}

// Struct สำหรับรับข้อมูล (DTO)
type CreateSubjectRequest struct {
	Code        string `json:"code" example:"MAT101"`
	Name        string `json:"name" example:"Mathematics"`
	Description string `json:"description" example:"Basic Math"`
}

// CreateSubject godoc
// @Summary      สร้างรายวิชาใหม่
// @Description  เพิ่มรายวิชาเข้าสู่ระบบ
// @Tags         Subjects
// @Accept       json
// @Produce      json
// @Param        request body CreateSubjectRequest true "ข้อมูลวิชา"
// @Security     ApiKeyAuth
// @Success      201  {object} domain.Subject
// @Failure      400  {object} map[string]interface{}
// @Router       /subjects [post] 
func (h *SubjectHandler) CreateSubject(c *fiber.Ctx) error {
	req := new(CreateSubjectRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	subject := domain.Subject{
		Code:        req.Code,
		Name:        req.Name,
		Description: req.Description,
		IsActive:    true,
	}

	if err := h.service.CreateSubject(&subject); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(subject)
}

// GetAllSubjects godoc
// @Summary      ดึงรายวิชาทั้งหมด
// @Tags         Subjects
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200  {array} domain.Subject
// @Router       /subjects [get]
func (h *SubjectHandler) GetAllSubjects(c *fiber.Ctx) error {
	subjects, err := h.service.GetAllSubjects()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(subjects)
}

// GetSubjectByID godoc
// @Summary      ดึงรายละเอียดวิชาตาม ID
// @Tags         Subjects
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "Subject ID"
// @Security     ApiKeyAuth
// @Success      200  {object} domain.Subject
// @Failure      404  {object} map[string]interface{}
// @Router       /subjects/{id} [get]
func (h *SubjectHandler) GetSubjectByID(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	subject, err := h.service.GetSubjectByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Subject not found"})
	}
	return c.JSON(subject)
}

// UpdateSubject godoc
// @Summary      แก้ไขรายวิชา
// @Tags         Subjects
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "Subject ID"
// @Param        request body CreateSubjectRequest true "ข้อมูลที่ต้องการแก้ไข"
// @Security     ApiKeyAuth
// @Success      200  {object} map[string]interface{}
// @Router       /subjects/{id} [put]
func (h *SubjectHandler) UpdateSubject(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	req := new(domain.Subject) // Reuse domain model for simplicity here
	
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	if err := h.service.UpdateSubject(uint(id), req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Subject updated successfully"})
}

// DeleteSubject godoc
// @Summary      ลบรายวิชา
// @Tags         Subjects
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "Subject ID"
// @Security     ApiKeyAuth
// @Success      200  {object} map[string]interface{}
// @Router       /subjects/{id} [delete]
func (h *SubjectHandler) DeleteSubject(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	if err := h.service.DeleteSubject(uint(id)); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Subject deleted successfully"})
}