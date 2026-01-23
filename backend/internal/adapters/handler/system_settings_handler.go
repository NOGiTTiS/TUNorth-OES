package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
)

type SystemSettingHandler struct {
	service ports.ISystemSettingService
}

func NewSystemSettingHandler(service ports.ISystemSettingService) *SystemSettingHandler {
	return &SystemSettingHandler{service: service}
}

// GetSettings godoc
// @Summary      Get all system settings (Admin only)
// @Tags         Settings
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200  {object} domain.SystemSetting
// @Router       /settings [get]
func (h *SystemSettingHandler) GetSettings(c *fiber.Ctx) error {
	// Check user role
	userToken := c.Locals("user").(*jwt.Token)
	claims := userToken.Claims.(jwt.MapClaims)
	role := claims["role"].(string)

	if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized"})
	}

	settings, err := h.service.GetSettings()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(settings)
}

// GetPublicSettings godoc
// @Summary      Get public system settings (Title, Logo, Theme)
// @Tags         Settings
// @Accept       json
// @Produce      json
// @Success      200  {object} map[string]interface{}
// @Router       /settings/public [get]
func (h *SystemSettingHandler) GetPublicSettings(c *fiber.Ctx) error {
	settings, err := h.service.GetSettings()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	// Filter sensitive data
	publicSettings := map[string]interface{}{
		"system_name":        settings.SystemName,
		"system_description": settings.SystemDescription,
		"copyright":          settings.Copyright,
		"register_enabled":   settings.RegisterEnabled,
		"logo_url":           settings.LogoUrl,
		"favicon_url":        settings.FaviconUrl,
		"main_color":         settings.MainColor,
		"second_color":       settings.SecondColor,
		"bg_gradient_start":  settings.BgGradientStart,
		"bg_gradient_end":    settings.BgGradientEnd,
		"style":              settings.Style,
	}
	return c.JSON(publicSettings)
}

// UpdateSettings godoc
// @Summary      Update system settings (Admin only)
// @Tags         Settings
// @Accept       json
// @Produce      json
// @Param        request body domain.SystemSetting true "System Settings"
// @Security     ApiKeyAuth
// @Success      200  {object} map[string]interface{}
// @Router       /settings [put]
func (h *SystemSettingHandler) UpdateSettings(c *fiber.Ctx) error {
	// Check user role
	userToken := c.Locals("user").(*jwt.Token)
	claims := userToken.Claims.(jwt.MapClaims)
	role := claims["role"].(string)

	if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized"})
	}

	req := new(domain.SystemSetting)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	if err := h.service.UpdateSettings(req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Settings updated successfully"})
}
