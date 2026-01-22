package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nogittis/tunorth-oes-backend/internal/adapters/gateway"
)

type UploadHandler struct {
	cloudService *gateway.CloudinaryService
}

func NewUploadHandler(cloudService *gateway.CloudinaryService) *UploadHandler {
	return &UploadHandler{cloudService: cloudService}
}

// UploadImage godoc
// @Summary      อัปโหลดรูปภาพ
// @Tags         Utilities
// @Accept       mpfd
// @Produce      json
// @Param        image formData file true "รูปภาพที่ต้องการอัปโหลด"
// @Security     ApiKeyAuth
// @Success      200  {object} map[string]string
// @Router       /upload [post]
func (h *UploadHandler) UploadImage(c *fiber.Ctx) error {
	// รับไฟล์จาก Key ชื่อ "image"
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Image is required"})
	}

	// เรียก Service อัปโหลด
	url, err := h.cloudService.UploadImage(file)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to upload image: " + err.Error()})
	}

	return c.JSON(fiber.Map{
		"url": url,
	})
}