package services

import (
	"errors"
	"time"

	"github.com/nogittis/tunorth-oes-backend/internal/core/domain"
	"github.com/nogittis/tunorth-oes-backend/internal/core/ports"
)

type attemptService struct {
	attemptRepo  ports.IAttemptRepository
	examRepo     ports.IExamRepository // ต้องใช้อันนี้เพื่อดึงเฉลยมาตรวจ
}

func NewAttemptService(attemptRepo ports.IAttemptRepository, examRepo ports.IExamRepository) ports.IAttemptService {
	return &attemptService{
		attemptRepo: attemptRepo,
		examRepo:    examRepo,
	}
}

func (s *attemptService) StartExam(userID, examID uint) (*domain.ExamAttempt, error) {
	// 1. เช็คว่าเคยเริ่มทำไปแล้วหรือยัง (และยังไม่ส่ง)
	active, err := s.attemptRepo.FindActiveAttempt(userID, examID)
	if err != nil {
		return nil, err
	}
	if active != nil {
		return active, nil // ถ้ามีอยู่แล้ว ให้คืนค่าเดิมกลับไป (Resume)
	}

	// 2. สร้าง Record ใหม่
	newAttempt := domain.ExamAttempt{
		UserID:    userID,
		ExamID:    examID,
		StartTime: time.Now(),
		IsSubmitted: false,
	}
	
	if err := s.attemptRepo.Create(&newAttempt); err != nil {
		return nil, err
	}
	
	return &newAttempt, nil
}

func (s *attemptService) SubmitExam(attemptID uint, userAnswers []ports.SubmitAnswerRequest) (*domain.ExamAttempt, error) {
	// 1. ดึงข้อมูล Attempt
	attempt, err := s.attemptRepo.FindByID(attemptID)
	if err != nil {
		return nil, errors.New("attempt not found")
	}
	
	if attempt.IsSubmitted {
		return nil, errors.New("exam already submitted")
	}

	// 2. ดึงข้อสอบและเฉลยจาก DB (Exam -> Questions -> Choices)
	exam, err := s.examRepo.FindByID(attempt.ExamID)
	if err != nil {
		return nil, err
	}

	// 3. เริ่มตรวจคะแนน
	score := 0
	maxScore := len(exam.Questions)
	var answerRecords []domain.ExamAnswer

	// Map เฉลยไว้เพื่อความเร็วในการค้นหา: QuestionID -> CorrectChoiceID
	correctChoices := make(map[uint]uint)
	for _, q := range exam.Questions {
		for _, c := range q.Choices {
			if c.IsCorrect {
				correctChoices[q.ID] = c.ID
				break
			}
		}
	}

	// วนลูปคำตอบที่นักเรียนส่งมา
	for _, ans := range userAnswers {
		// ตรวจว่าถูกไหม
		if correctID, ok := correctChoices[ans.QuestionID]; ok {
			if ans.ChoiceID == correctID {
				score++
			}
		}

		// เตรียมบันทึกลง DB
		answerRecords = append(answerRecords, domain.ExamAnswer{
			AttemptID:        attemptID,
			QuestionID:       ans.QuestionID,
			SelectedChoiceID: ans.ChoiceID,
		})
	}

	// 4. อัปเดตข้อมูล
	attempt.EndTime = time.Now()
	attempt.IsSubmitted = true
	attempt.Score = score
	attempt.MaxScore = maxScore
	attempt.Answers = answerRecords // GORM จะบันทึกตารางลูกให้

	if err := s.attemptRepo.Update(attempt); err != nil {
		return nil, err
	}

	if !exam.ShowScore {
        attempt.Score = -1
        attempt.MaxScore = -1
    }

	return attempt, nil
}

func (s *attemptService) GetStudentHistory(userID uint) ([]domain.ExamAttempt, error) {
	attempts, err := s.attemptRepo.FindByUser(userID)
	if err != nil {
		return nil, err
	}

	// วนลูปเพื่อซ่อนคะแนน ถ้าครูปิดไว้
	for i := range attempts {
        // เช็คว่ามีข้อมูล Exam และ ShowScore เป็น false หรือไม่
		if attempts[i].Exam.ID != 0 && !attempts[i].Exam.ShowScore {
			attempts[i].Score = -1    // ใช้ -1 เป็นรหัสลับบอกว่า "ซ่อนคะแนน"
			attempts[i].MaxScore = -1 // ซ่อนคะแนนเต็มด้วยก็ได้
            // attempts[i].Answers = nil // (Optional) ซ่อนเฉลยด้วยถ้ามี
		}
	}

	return attempts, nil
}

func (s *attemptService) GetExamResults(examID uint) ([]domain.ExamAttempt, error) {
    return s.attemptRepo.FindByExamID(examID)
}