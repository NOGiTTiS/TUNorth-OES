package handler

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
)

type ClassHandler struct {
	classService ports.ClassService
}

func NewClassHandler(classService ports.ClassService) *ClassHandler {
	return &ClassHandler{classService: classService}
}

// CreateClass godoc
// @Summary Create a new class
// @Description Create a new student class (e.g. 6.1)
// @Tags classes
// @Accept json
// @Produce json
// @Param request body domain.CreateClassRequest true "Class info"
// @Success 201 {object} domain.Class
// @Router /classes [post]
func (h *ClassHandler) CreateClass(c *fiber.Ctx) error {
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	class, err := h.classService.CreateClass(req.Name, req.Description)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(class)
}

// GetAllClasses godoc
// @Summary Get all classes
// @Description Get a list of all classes
// @Tags classes
// @Produce json
// @Success 200 {array} domain.Class
// @Router /classes [get]
func (h *ClassHandler) GetAllClasses(c *fiber.Ctx) error {
	classes, err := h.classService.GetAllClasses()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(classes)
}

// GetClassByID godoc
// @Summary Get class by ID
// @Description Get details of a specific class
// @Tags classes
// @Produce json
// @Param id path int true "Class ID"
// @Success 200 {object} domain.Class
// @Router /classes/{id} [get]
func (h *ClassHandler) GetClassByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	class, err := h.classService.GetClassByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	if class == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Class not found"})
	}

	return c.JSON(class)
}

// UpdateClass godoc
// @Summary Update class
// @Description Update class details
// @Tags classes
// @Accept json
// @Produce json
// @Param id path int true "Class ID"
// @Param request body domain.UpdateClassRequest true "Class info"
// @Success 200 {object} domain.Class
// @Router /classes/{id} [put]
func (h *ClassHandler) UpdateClass(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	class, err := h.classService.UpdateClass(uint(id), req.Name, req.Description)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(class)
}

// DeleteClass godoc
// @Summary Delete class
// @Description Delete a class
// @Tags classes
// @Param id path int true "Class ID"
// @Success 200 {object} map[string]string
// @Router /classes/{id} [delete]
func (h *ClassHandler) DeleteClass(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	if err := h.classService.DeleteClass(uint(id)); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Class deleted successfully"})
}
