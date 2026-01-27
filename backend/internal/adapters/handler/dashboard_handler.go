package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
)

type DashboardHandler struct {
	dashboardService ports.IDashboardService
}

func NewDashboardHandler(service ports.IDashboardService) *DashboardHandler {
	return &DashboardHandler{
		dashboardService: service,
	}
}

// GetStats godoc
// @Summary      ดึงสถิติภาพรวม (Admin)
// @Tags         Dashboard
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200  {object} ports.DashboardStats
// @Router       /dashboard/stats [get]
func (h *DashboardHandler) GetStats(c *fiber.Ctx) error {
	stats, err := h.dashboardService.GetAdminStats()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(stats)
}
