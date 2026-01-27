package ports

type DashboardStats struct {
	TotalStudents    int64 `json:"total_students"`
	ActiveExams      int64 `json:"active_exams"`
	SubmittedAnswers int64 `json:"submitted_answers"`
}

type IDashboardService interface {
	GetAdminStats() (*DashboardStats, error)
}
