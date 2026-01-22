package handler

import (
	"strconv"
	"github.com/gofiber/fiber/v2"
	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
)

// --- Structs สำหรับรับ Request (ย้ายมาไว้นอก func) ---

// RegisterRequest โครงสร้างข้อมูลสำหรับสมัครสมาชิก
type RegisterRequest struct {
	Username  string `json:"username" example:"student01"`
	Password  string `json:"password" example:"pass1234"`
	FirstName string `json:"first_name" example:"Somsak"`
	LastName  string `json:"last_name" example:"Rakrian"`
	Role      string `json:"role" example:"student"` // admin, teacher, student
}

// LoginRequest โครงสร้างข้อมูลสำหรับเข้าสู่ระบบ
type LoginRequest struct {
	Username string `json:"username" example:"student01"`
	Password string `json:"password" example:"pass1234"`
}

// --------------------------------------------------

type UserHandler struct {
	userService ports.IUserService
}

func NewUserHandler(service ports.IUserService) *UserHandler {
	return &UserHandler{
		userService: service,
	}
}

// Register godoc
// @Summary      สมัครสมาชิกใหม่
// @Description  ลงทะเบียนผู้ใช้งานเข้าสู่ระบบ (Student, Teacher)
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        request body RegisterRequest true "ข้อมูลสมัครสมาชิก"
// @Success      201  {object} map[string]interface{}
// @Failure      400  {object} map[string]interface{}
// @Failure      409  {object} map[string]interface{}
// @Failure      500  {object} map[string]interface{}
// @Router       /auth/register [post]
func (h *UserHandler) Register(c *fiber.Ctx) error {
	req := new(RegisterRequest) // เรียกใช้ struct ด้านบน

	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.Username == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Username and Password are required"})
	}

	user := domain.User{
		Username:  req.Username,
		Password:  req.Password,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Role:      domain.UserRole(req.Role),
	}

	if user.Role == "" {
		user.Role = domain.RoleStudent
	}

	err := h.userService.Register(&user)
	if err != nil {
		if err.Error() == "username already exists" {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Username already exists"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create user"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "User registered successfully",
		"user": fiber.Map{
			"username": user.Username,
			"role":     user.Role,
		},
	})
}

// Login godoc
// @Summary      เข้าสู่ระบบ
// @Description  ตรวจสอบ username/password และรับ JWT Token
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        request body LoginRequest true "ข้อมูลล็อคอิน"
// @Success      200  {object} map[string]interface{}
// @Failure      400  {object} map[string]interface{}
// @Failure      401  {object} map[string]interface{}
// @Router       /auth/login [post]
func (h *UserHandler) Login(c *fiber.Ctx) error {
	req := new(LoginRequest)

	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	token, err := h.userService.Login(req.Username, req.Password)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid username or password"})
	}

	return c.JSON(fiber.Map{
		"message": "Login successful",
		"token":   token,
	})
}

// GetAllUsers godoc
// @Summary      ดึงรายชื่อผู้ใช้ทั้งหมด
// @Tags         Admin
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200  {array} domain.User
// @Router       /users [get]
func (h *UserHandler) GetAllUsers(c *fiber.Ctx) error {
	users, err := h.userService.GetAllUsers()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(users)
}

// DeleteUser godoc
// @Summary      ลบผู้ใช้งาน
// @Tags         Admin
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "User ID"
// @Security     ApiKeyAuth
// @Success      200  {object} map[string]interface{}
// @Router       /users/{id} [delete]
func (h *UserHandler) DeleteUser(c *fiber.Ctx) error {
	// TODO: ควรเช็คด้วยว่า User ที่กำลังลบ ไม่ใช่ตัวเอง และคนลบต้องเป็น Admin
	
	id, _ := strconv.Atoi(c.Params("id"))
	if err := h.userService.DeleteUser(uint(id)); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "User deleted successfully"})
}