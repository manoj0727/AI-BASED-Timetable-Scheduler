package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Base model with UUID, timestamps
type Base struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook for Base model
func (b *Base) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}

// =====================================================
// CORE ACADEMIC MODELS
// =====================================================

// AcademicYear represents an academic year (e.g., 2024-2025)
type AcademicYear struct {
	Base
	Year      string    `json:"year" gorm:"uniqueIndex;not null"`
	StartDate time.Time `json:"start_date" gorm:"not null"`
	EndDate   time.Time `json:"end_date" gorm:"not null"`
	IsActive  bool      `json:"is_active" gorm:"default:false;index"`

	// Relations
	Semesters []Semester `json:"semesters,omitempty" gorm:"foreignKey:AcademicYearID"`
}

// Semester represents a semester within an academic year
type Semester struct {
	Base
	AcademicYearID uuid.UUID `json:"academic_year_id" gorm:"not null;index"`
	Name           string    `json:"name" gorm:"not null"`
	Type           string    `json:"type" gorm:"not null;check:type IN ('ODD','EVEN','SUMMER')"`
	SemesterNumber int       `json:"semester_number" gorm:"not null;check:semester_number BETWEEN 1 AND 12"`
	StartDate      time.Time `json:"start_date" gorm:"not null"`
	EndDate        time.Time `json:"end_date" gorm:"not null"`
	IsActive       bool      `json:"is_active" gorm:"default:false;index"`

	// Relations
	AcademicYear        AcademicYear          `json:"academic_year,omitempty" gorm:"foreignKey:AcademicYearID"`
	StudentEnrollments  []StudentEnrollment   `json:"enrollments,omitempty" gorm:"foreignKey:SemesterID"`
	ScheduledClasses    []ScheduledClass      `json:"scheduled_classes,omitempty" gorm:"foreignKey:SemesterID"`
	TimetableTemplates  []TimetableTemplate   `json:"timetable_templates,omitempty" gorm:"foreignKey:SemesterID"`
}

// Department represents an academic department
type Department struct {
	Base
	Name              string `json:"name" gorm:"not null"`
	Code              string `json:"code" gorm:"uniqueIndex;not null"`
	Description       string `json:"description" gorm:"type:text"`
	HeadOfDepartment  string `json:"head_of_department"`

	// Relations
	Programs []Program `json:"programs,omitempty" gorm:"foreignKey:DepartmentID"`
	Courses  []Course  `json:"courses,omitempty" gorm:"foreignKey:DepartmentID"`
	Faculty  []Faculty `json:"faculty,omitempty" gorm:"foreignKey:DepartmentID"`
}

// Program represents an academic program (FYUP, B.Ed., etc.)
type Program struct {
	Base
	Name           string     `json:"name" gorm:"not null"`
	Code           string     `json:"code" gorm:"uniqueIndex;not null"`
	ProgramType    string     `json:"program_type" gorm:"not null;check:program_type IN ('FYUP','B_ED','M_ED','ITEP','DIPLOMA','CERTIFICATE')"`
	DepartmentID   *uuid.UUID `json:"department_id" gorm:"index"`
	DurationYears  int        `json:"duration_years" gorm:"not null;check:duration_years BETWEEN 1 AND 6"`
	TotalCredits   int        `json:"total_credits" gorm:"not null"`
	Description    string     `json:"description" gorm:"type:text"`

	// Relations
	Department         *Department         `json:"department,omitempty" gorm:"foreignKey:DepartmentID"`
	Students           []Student           `json:"students,omitempty" gorm:"foreignKey:ProgramID"`
	TimetableTemplates []TimetableTemplate `json:"timetable_templates,omitempty" gorm:"foreignKey:ProgramID"`
}

// CourseCategory represents NEP 2020 course categories
type CourseCategory struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	Code        string    `json:"code" gorm:"uniqueIndex;not null"`
	Name        string    `json:"name" gorm:"not null"`
	Description string    `json:"description" gorm:"type:text"`

	// Relations
	Courses []Course `json:"courses,omitempty" gorm:"foreignKey:CategoryID"`
}

// Course represents a course
type Course struct {
	Base
	Code          string     `json:"code" gorm:"uniqueIndex;not null"`
	Name          string     `json:"name" gorm:"not null"`
	DepartmentID  *uuid.UUID `json:"department_id" gorm:"index"`
	CategoryID    *uuid.UUID `json:"category_id" gorm:"index"`
	CourseType    string     `json:"course_type" gorm:"not null;check:course_type IN ('THEORY','PRACTICAL','LAB','SEMINAR','PROJECT','FIELDWORK')"`
	Credits       int        `json:"credits" gorm:"not null;check:credits >= 0"`
	HoursPerWeek  int        `json:"hours_per_week" gorm:"not null;check:hours_per_week > 0"`
	Description   string     `json:"description" gorm:"type:text"`
	Prerequisites []string   `json:"prerequisites" gorm:"type:text[]"`
	IsActive      bool       `json:"is_active" gorm:"default:true;index"`

	// Relations
	Department             *Department              `json:"department,omitempty" gorm:"foreignKey:DepartmentID"`
	Category               *CourseCategory          `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	StudentEnrollments     []StudentEnrollment      `json:"enrollments,omitempty" gorm:"foreignKey:CourseID"`
	FacultyCourseExpertise []FacultyCourseExpertise `json:"faculty_expertise,omitempty" gorm:"foreignKey:CourseID"`
	ScheduledClasses       []ScheduledClass         `json:"scheduled_classes,omitempty" gorm:"foreignKey:CourseID"`
}

// Faculty represents a faculty member
type Faculty struct {
	Base
	UserID           *uuid.UUID `json:"user_id" gorm:"index"` // Links to Supabase auth.users
	EmployeeID       string     `json:"employee_id" gorm:"uniqueIndex;not null"`
	FirstName        string     `json:"first_name" gorm:"not null"`
	LastName         string     `json:"last_name" gorm:"not null"`
	Email            string     `json:"email" gorm:"uniqueIndex;not null;index"`
	Phone            string     `json:"phone"`
	DepartmentID     *uuid.UUID `json:"department_id" gorm:"index"`
	Designation      string     `json:"designation" gorm:"not null"`
	Qualification    string     `json:"qualification"`
	MaxHoursPerWeek  int        `json:"max_hours_per_week" gorm:"default:20;check:max_hours_per_week BETWEEN 0 AND 40"`
	IsActive         bool       `json:"is_active" gorm:"default:true;index"`

	// Relations
	Department             *Department              `json:"department,omitempty" gorm:"foreignKey:DepartmentID"`
	Availability           []FacultyAvailability    `json:"availability,omitempty" gorm:"foreignKey:FacultyID"`
	CourseExpertise        []FacultyCourseExpertise `json:"course_expertise,omitempty" gorm:"foreignKey:FacultyID"`
	ScheduledClasses       []ScheduledClass         `json:"scheduled_classes,omitempty" gorm:"foreignKey:FacultyID"`
}

// FacultyAvailability represents faculty availability slots
type FacultyAvailability struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	FacultyID   uuid.UUID `json:"faculty_id" gorm:"not null;index"`
	DayOfWeek   int       `json:"day_of_week" gorm:"not null;check:day_of_week BETWEEN 0 AND 6"` // 0=Sunday
	StartTime   string    `json:"start_time" gorm:"type:time;not null"`
	EndTime     string    `json:"end_time" gorm:"type:time;not null"`
	IsAvailable bool      `json:"is_available" gorm:"default:true"`

	// Relations
	Faculty Faculty `json:"faculty,omitempty" gorm:"foreignKey:FacultyID"`
}

// FacultyCourseExpertise maps faculty to courses they can teach
type FacultyCourseExpertise struct {
	ID                uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	FacultyID         uuid.UUID `json:"faculty_id" gorm:"not null;index"`
	CourseID          uuid.UUID `json:"course_id" gorm:"not null;index"`
	PreferenceLevel   int       `json:"preference_level" gorm:"default:3;check:preference_level BETWEEN 1 AND 5"`
	YearsOfExperience int       `json:"years_of_experience" gorm:"default:0"`

	// Relations
	Faculty Faculty `json:"faculty,omitempty" gorm:"foreignKey:FacultyID"`
	Course  Course  `json:"course,omitempty" gorm:"foreignKey:CourseID"`
}

// Room represents a classroom, lab, or hall
type Room struct {
	Base
	RoomNumber     string `json:"room_number" gorm:"uniqueIndex;not null"`
	Building       string `json:"building"`
	Floor          *int   `json:"floor"`
	RoomType       string `json:"room_type" gorm:"not null;check:room_type IN ('CLASSROOM','LAB','SEMINAR_HALL','AUDITORIUM','CONFERENCE_ROOM')"`
	Capacity       int    `json:"capacity" gorm:"not null;check:capacity > 0"`
	HasProjector   bool   `json:"has_projector" gorm:"default:false"`
	HasComputer    bool   `json:"has_computer" gorm:"default:false"`
	HasWhiteboard  bool   `json:"has_whiteboard" gorm:"default:true"`
	HasSmartBoard  bool   `json:"has_smart_board" gorm:"default:false"`
	IsAC           bool   `json:"is_ac" gorm:"default:false"`
	IsAvailable    bool   `json:"is_available" gorm:"default:true;index"`

	// Relations
	ScheduledClasses []ScheduledClass `json:"scheduled_classes,omitempty" gorm:"foreignKey:RoomID"`
}

// Student represents a student
type Student struct {
	Base
	UserID          *uuid.UUID `json:"user_id" gorm:"index"` // Links to Supabase auth.users
	StudentID       string     `json:"student_id" gorm:"uniqueIndex;not null"`
	FirstName       string     `json:"first_name" gorm:"not null"`
	LastName        string     `json:"last_name" gorm:"not null"`
	Email           string     `json:"email" gorm:"uniqueIndex;not null;index"`
	Phone           string     `json:"phone"`
	ProgramID       *uuid.UUID `json:"program_id" gorm:"index"`
	CurrentSemester *int       `json:"current_semester" gorm:"check:current_semester BETWEEN 1 AND 12"`
	AdmissionYear   int        `json:"admission_year" gorm:"not null"`
	DateOfBirth     *time.Time `json:"date_of_birth"`
	IsActive        bool       `json:"is_active" gorm:"default:true"`

	// Relations
	Program     *Program            `json:"program,omitempty" gorm:"foreignKey:ProgramID"`
	Enrollments []StudentEnrollment `json:"enrollments,omitempty" gorm:"foreignKey:StudentID"`
}

// StudentEnrollment represents student course enrollments
type StudentEnrollment struct {
	ID             uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	StudentID      uuid.UUID  `json:"student_id" gorm:"not null;index"`
	CourseID       uuid.UUID  `json:"course_id" gorm:"not null;index"`
	SemesterID     uuid.UUID  `json:"semester_id" gorm:"not null;index"`
	EnrollmentDate time.Time  `json:"enrollment_date" gorm:"default:CURRENT_DATE"`
	Grade          *string    `json:"grade"`
	Status         string     `json:"status" gorm:"default:'ENROLLED';check:status IN ('ENROLLED','COMPLETED','DROPPED','FAILED')"`

	// Relations
	Student  Student  `json:"student,omitempty" gorm:"foreignKey:StudentID"`
	Course   Course   `json:"course,omitempty" gorm:"foreignKey:CourseID"`
	Semester Semester `json:"semester,omitempty" gorm:"foreignKey:SemesterID"`
}

// =====================================================
// TIMETABLE MODELS
// =====================================================

// TimetableTemplate represents a timetable configuration
type TimetableTemplate struct {
	Base
	Name                 string     `json:"name" gorm:"not null"`
	SemesterID           uuid.UUID  `json:"semester_id" gorm:"not null;index"`
	ProgramID            *uuid.UUID `json:"program_id" gorm:"index"`
	Status               string     `json:"status" gorm:"default:'DRAFT';check:status IN ('DRAFT','GENERATING','GENERATED','PUBLISHED','ARCHIVED')"`
	GenerationStartTime  *time.Time `json:"generation_start_time"`
	GenerationEndTime    *time.Time `json:"generation_end_time"`
	AlgorithmUsed        *string    `json:"algorithm_used"`
	IsPublished          bool       `json:"is_published" gorm:"default:false"`
	PublishedAt          *time.Time `json:"published_at"`
	CreatedBy            *uuid.UUID `json:"created_by"` // Links to auth.users

	// Relations
	Semester             Semester               `json:"semester,omitempty" gorm:"foreignKey:SemesterID"`
	Program              *Program               `json:"program,omitempty" gorm:"foreignKey:ProgramID"`
	TimeSlots            []TimeSlot             `json:"time_slots,omitempty" gorm:"foreignKey:TimetableID"`
	ScheduledClasses     []ScheduledClass       `json:"scheduled_classes,omitempty" gorm:"foreignKey:TimetableID"`
	Constraints          []TimetableConstraint  `json:"constraints,omitempty" gorm:"foreignKey:TimetableID"`
	ConflictLogs         []ConflictLog          `json:"conflict_logs,omitempty" gorm:"foreignKey:TimetableID"`
}

// TimeSlot represents available time slots
type TimeSlot struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	TimetableID uuid.UUID `json:"timetable_id" gorm:"not null;index"`
	DayOfWeek   int       `json:"day_of_week" gorm:"not null;check:day_of_week BETWEEN 0 AND 6"`
	StartTime   string    `json:"start_time" gorm:"type:time;not null"`
	EndTime     string    `json:"end_time" gorm:"type:time;not null"`
	SlotType    string    `json:"slot_type" gorm:"default:'REGULAR';check:slot_type IN ('REGULAR','BREAK','LUNCH','SPECIAL')"`

	// Relations
	Timetable        TimetableTemplate `json:"timetable,omitempty" gorm:"foreignKey:TimetableID"`
	ScheduledClasses []ScheduledClass  `json:"scheduled_classes,omitempty" gorm:"foreignKey:TimeSlotID"`
}

// ScheduledClass represents an individual class assignment
type ScheduledClass struct {
	Base
	TimetableID  uuid.UUID  `json:"timetable_id" gorm:"not null;index"`
	CourseID     uuid.UUID  `json:"course_id" gorm:"not null;index"`
	FacultyID    *uuid.UUID `json:"faculty_id" gorm:"index"`
	RoomID       *uuid.UUID `json:"room_id" gorm:"index"`
	TimeSlotID   uuid.UUID  `json:"time_slot_id" gorm:"not null"`
	DayOfWeek    int        `json:"day_of_week" gorm:"not null;check:day_of_week BETWEEN 0 AND 6;index"`
	StartTime    string     `json:"start_time" gorm:"type:time;not null"`
	EndTime      string     `json:"end_time" gorm:"type:time;not null"`
	SemesterID   uuid.UUID  `json:"semester_id" gorm:"not null;index"`
	IsLab        bool       `json:"is_lab" gorm:"default:false"`
	IsTutorial   bool       `json:"is_tutorial" gorm:"default:false"`
	BatchNumber  *int       `json:"batch_number"`

	// Relations
	Timetable TimetableTemplate `json:"timetable,omitempty" gorm:"foreignKey:TimetableID"`
	Course    Course            `json:"course,omitempty" gorm:"foreignKey:CourseID"`
	Faculty   *Faculty          `json:"faculty,omitempty" gorm:"foreignKey:FacultyID"`
	Room      *Room             `json:"room,omitempty" gorm:"foreignKey:RoomID"`
	TimeSlot  TimeSlot          `json:"time_slot,omitempty" gorm:"foreignKey:TimeSlotID"`
	Semester  Semester          `json:"semester,omitempty" gorm:"foreignKey:SemesterID"`
}

// TimetableConstraint represents scheduling constraints
type TimetableConstraint struct {
	ID              uuid.UUID              `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	TimetableID     uuid.UUID              `json:"timetable_id" gorm:"not null;index"`
	ConstraintType  string                 `json:"constraint_type" gorm:"not null"`
	ConstraintData  map[string]interface{} `json:"constraint_data" gorm:"type:jsonb;not null"`
	Priority        int                    `json:"priority" gorm:"default:1;check:priority BETWEEN 1 AND 10"`
	IsHardConstraint bool                  `json:"is_hard_constraint" gorm:"default:false"`
	CreatedAt       time.Time              `json:"created_at" gorm:"autoCreateTime"`

	// Relations
	Timetable TimetableTemplate `json:"timetable,omitempty" gorm:"foreignKey:TimetableID"`
}

// ConflictLog tracks scheduling conflicts
type ConflictLog struct {
	ID               uuid.UUID              `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	TimetableID      uuid.UUID              `json:"timetable_id" gorm:"not null;index"`
	ConflictType     string                 `json:"conflict_type" gorm:"not null"`
	Description      string                 `json:"description" gorm:"type:text;not null"`
	Severity         string                 `json:"severity" gorm:"default:'MEDIUM';check:severity IN ('LOW','MEDIUM','HIGH','CRITICAL');index"`
	AffectedEntities map[string]interface{} `json:"affected_entities" gorm:"type:jsonb"`
	IsResolved       bool                   `json:"is_resolved" gorm:"default:false;index"`
	ResolvedAt       *time.Time             `json:"resolved_at"`
	CreatedAt        time.Time              `json:"created_at" gorm:"autoCreateTime"`

	// Relations
	Timetable TimetableTemplate `json:"timetable,omitempty" gorm:"foreignKey:TimetableID"`
}
