package services

import (
	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
)

type systemSettingService struct {
	repo ports.ISystemSettingRepository
}

func NewSystemSettingService(repo ports.ISystemSettingRepository) ports.ISystemSettingService {
	return &systemSettingService{repo: repo}
}

func (s *systemSettingService) GetSettings() (*domain.SystemSetting, error) {
	return s.repo.GetSettings()
}

func (s *systemSettingService) UpdateSettings(settings *domain.SystemSetting) error {
	return s.repo.SaveSettings(settings)
}
