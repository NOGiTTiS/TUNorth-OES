package ports

import "github.com/nogittis/tunorth-oes-backend/internal/core/domain"

type ISystemSettingService interface {
	GetSettings() (*domain.SystemSetting, error)
	UpdateSettings(settings *domain.SystemSetting) error
}

type ISystemSettingRepository interface {
	GetSettings() (*domain.SystemSetting, error)
	SaveSettings(settings *domain.SystemSetting) error
}
