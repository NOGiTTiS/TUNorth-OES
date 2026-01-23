package repository

import (
	"errors"

	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
	"gorm.io/gorm"
)

type systemSettingRepo struct {
	db *gorm.DB
}

func NewSystemSettingRepository(db *gorm.DB) ports.ISystemSettingRepository {
	return &systemSettingRepo{db: db}
}

func (r *systemSettingRepo) GetSettings() (*domain.SystemSetting, error) {
	var settings domain.SystemSetting
	// Always try to get the first record
	if err := r.db.First(&settings).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Initialize default settings if not found
			settings = domain.SystemSetting{
				SystemName:      "TUNorth-OES",
				RegisterEnabled: true,
				MainColor:       "#000000",
				SecondColor:     "#ffffff",
				Style:           "default",
			}
			if err := r.db.Create(&settings).Error; err != nil {
				return nil, err
			}
			return &settings, nil
		}
		return nil, err
	}
	return &settings, nil
}

func (r *systemSettingRepo) SaveSettings(settings *domain.SystemSetting) error {
	var existing domain.SystemSetting
	// Ensure we are updating the single existing record if it exists
	if err := r.db.First(&existing).Error; err == nil {
		settings.ID = existing.ID
	}

	return r.db.Save(settings).Error
}
