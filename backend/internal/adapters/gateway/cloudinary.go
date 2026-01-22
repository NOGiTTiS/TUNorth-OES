package gateway

import (
	"context"
	"mime/multipart"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type CloudinaryService struct {
	cld *cloudinary.Cloudinary
}

func NewCloudinaryService() (*CloudinaryService, error) {
	cld, err := cloudinary.NewFromParams(
		os.Getenv("CLOUDINARY_CLOUD_NAME"),
		os.Getenv("CLOUDINARY_API_KEY"),
		os.Getenv("CLOUDINARY_API_SECRET"),
	)
	if err != nil {
		return nil, err
	}
	return &CloudinaryService{cld: cld}, nil
}

func (s *CloudinaryService) UploadImage(file *multipart.FileHeader) (string, error) {
	// เปิดไฟล์
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	// อัปโหลดไป Cloudinary
	uploadResult, err := s.cld.Upload.Upload(context.Background(), src, uploader.UploadParams{
		Folder: "tunorth_oes", // ชื่อโฟลเดอร์ใน Cloudinary
	})
	if err != nil {
		return "", err
	}

	return uploadResult.SecureURL, nil
}