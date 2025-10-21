-- =====================================================
-- AI-Based Timetable Scheduler - Database Schema
-- Modern Stack: Local PostgreSQL
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =====================================================
-- CORE ACADEMIC TABLES
-- =====================================================

-- Academic Years
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year VARCHAR(20) NOT NULL UNIQUE, -- e.g., "2024-2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_year_range CHECK (end_date > start_date)
);

-- Semesters
CREATE TABLE semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- "Semester 1", "Semester 2"
    type VARCHAR(20) NOT NULL CHECK (type IN ('ODD', 'EVEN', 'SUMMER')),
    semester_number INTEGER NOT NULL CHECK (semester_number BETWEEN 1 AND 8),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_semester_range CHECK (end_date > start_date),
    UNIQUE(academic_year_id, semester_number)
);

-- Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    head_of_department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programs (FYUP, B.Ed., M.Ed., ITEP, etc.)
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    program_type VARCHAR(20) NOT NULL CHECK (program_type IN ('FYUP', 'B_ED', 'M_ED', 'ITEP', 'DIPLOMA', 'CERTIFICATE')),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    duration_years INTEGER NOT NULL CHECK (duration_years BETWEEN 1 AND 6),
    total_credits INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course Categories (NEP 2020 compliant)
CREATE TABLE course_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- NEP 2020 categories: MAJOR, MINOR, SKILL, AEC, VAC, SEC, MDC, etc.
    CONSTRAINT valid_category_code CHECK (code IN ('MAJOR', 'MINOR', 'SKILL', 'AEC', 'VAC', 'SEC', 'MDC', 'FOUNDATION', 'CORE', 'ELECTIVE'))
);

-- Courses
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    category_id UUID REFERENCES course_categories(id) ON DELETE SET NULL,
    course_type VARCHAR(20) NOT NULL CHECK (course_type IN ('THEORY', 'PRACTICAL', 'LAB', 'SEMINAR', 'PROJECT', 'FIELDWORK')),
    credits INTEGER NOT NULL CHECK (credits >= 0),
    hours_per_week INTEGER NOT NULL CHECK (hours_per_week > 0),
    description TEXT,
    prerequisites TEXT[], -- Array of prerequisite course codes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Faculty
CREATE TABLE faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Links to Supabase Auth
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    designation VARCHAR(50) NOT NULL, -- "Professor", "Associate Professor", etc.
    qualification VARCHAR(200),
    max_hours_per_week INTEGER DEFAULT 20 CHECK (max_hours_per_week BETWEEN 0 AND 40),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Faculty Availability (Day-wise time slots)
CREATE TABLE faculty_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, ..., 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,

    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    UNIQUE(faculty_id, day_of_week, start_time, end_time)
);

-- Faculty Course Expertise (which courses can faculty teach)
CREATE TABLE faculty_course_expertise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    preference_level INTEGER DEFAULT 3 CHECK (preference_level BETWEEN 1 AND 5), -- 1=Low, 5=High
    years_of_experience INTEGER DEFAULT 0,

    UNIQUE(faculty_id, course_id)
);

-- Rooms (Classrooms, Labs, Halls)
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number VARCHAR(50) NOT NULL UNIQUE,
    building VARCHAR(100),
    floor INTEGER,
    room_type VARCHAR(20) NOT NULL CHECK (room_type IN ('CLASSROOM', 'LAB', 'SEMINAR_HALL', 'AUDITORIUM', 'CONFERENCE_ROOM')),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    has_projector BOOLEAN DEFAULT false,
    has_computer BOOLEAN DEFAULT false,
    has_whiteboard BOOLEAN DEFAULT true,
    has_smart_board BOOLEAN DEFAULT false,
    is_ac BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Links to Supabase Auth
    student_id VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    current_semester INTEGER CHECK (current_semester BETWEEN 1 AND 12),
    admission_year INTEGER NOT NULL,
    date_of_birth DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Course Enrollments
CREATE TABLE student_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    grade VARCHAR(5), -- "A+", "A", "B+", etc.
    status VARCHAR(20) DEFAULT 'ENROLLED' CHECK (status IN ('ENROLLED', 'COMPLETED', 'DROPPED', 'FAILED')),

    UNIQUE(student_id, course_id, semester_id)
);

-- =====================================================
-- TIMETABLE TABLES
-- =====================================================

-- Timetable Templates (Master timetable configuration)
CREATE TABLE timetable_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'GENERATING', 'GENERATED', 'PUBLISHED', 'ARCHIVED')),
    generation_start_time TIMESTAMP WITH TIME ZONE,
    generation_end_time TIMESTAMP WITH TIME ZONE,
    algorithm_used VARCHAR(50), -- "hybrid", "genetic", "simulated_annealing", "tabu_search"
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time Slots
CREATE TABLE time_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timetable_id UUID NOT NULL REFERENCES timetable_templates(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_type VARCHAR(20) DEFAULT 'REGULAR' CHECK (slot_type IN ('REGULAR', 'BREAK', 'LUNCH', 'SPECIAL')),

    CONSTRAINT valid_slot_time CHECK (end_time > start_time),
    UNIQUE(timetable_id, day_of_week, start_time)
);

-- Scheduled Classes (Individual class assignments)
CREATE TABLE scheduled_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timetable_id UUID NOT NULL REFERENCES timetable_templates(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculty(id) ON DELETE SET NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    time_slot_id UUID NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,

    -- Optional fields for specific class types
    is_lab BOOLEAN DEFAULT false,
    is_tutorial BOOLEAN DEFAULT false,
    batch_number INTEGER, -- For dividing students into batches

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_class_time CHECK (end_time > start_time)
);

-- Timetable Constraints (Custom constraints for scheduling)
CREATE TABLE timetable_constraints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timetable_id UUID NOT NULL REFERENCES timetable_templates(id) ON DELETE CASCADE,
    constraint_type VARCHAR(50) NOT NULL, -- "NO_BACK_TO_BACK_LABS", "FACULTY_PREFERENCE", etc.
    constraint_data JSONB NOT NULL, -- Flexible JSON for constraint parameters
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 10), -- 1=Low, 10=High
    is_hard_constraint BOOLEAN DEFAULT false, -- Hard constraints must be satisfied
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conflict Logs (Track scheduling conflicts)
CREATE TABLE conflict_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timetable_id UUID NOT NULL REFERENCES timetable_templates(id) ON DELETE CASCADE,
    conflict_type VARCHAR(50) NOT NULL, -- "ROOM_DOUBLE_BOOKING", "FACULTY_OVERLOAD", etc.
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    affected_entities JSONB, -- JSON with IDs of affected courses, faculty, rooms
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Academic Years
CREATE INDEX idx_academic_years_active ON academic_years(is_active);
CREATE INDEX idx_academic_years_dates ON academic_years(start_date, end_date);

-- Semesters
CREATE INDEX idx_semesters_academic_year ON semesters(academic_year_id);
CREATE INDEX idx_semesters_active ON semesters(is_active);

-- Courses
CREATE INDEX idx_courses_department ON courses(department_id);
CREATE INDEX idx_courses_category ON courses(category_id);
CREATE INDEX idx_courses_active ON courses(is_active);
CREATE INDEX idx_courses_type ON courses(course_type);

-- Faculty
CREATE INDEX idx_faculty_department ON faculty(department_id);
CREATE INDEX idx_faculty_email ON faculty(email);
CREATE INDEX idx_faculty_active ON faculty(is_active);

-- Faculty Availability
CREATE INDEX idx_faculty_availability_faculty ON faculty_availability(faculty_id);
CREATE INDEX idx_faculty_availability_day ON faculty_availability(day_of_week);

-- Faculty Expertise
CREATE INDEX idx_faculty_expertise_faculty ON faculty_course_expertise(faculty_id);
CREATE INDEX idx_faculty_expertise_course ON faculty_course_expertise(course_id);

-- Rooms
CREATE INDEX idx_rooms_type ON rooms(room_type);
CREATE INDEX idx_rooms_available ON rooms(is_available);

-- Students
CREATE INDEX idx_students_program ON students(program_id);
CREATE INDEX idx_students_email ON students(email);

-- Enrollments
CREATE INDEX idx_enrollments_student ON student_enrollments(student_id);
CREATE INDEX idx_enrollments_course ON student_enrollments(course_id);
CREATE INDEX idx_enrollments_semester ON student_enrollments(semester_id);

-- Scheduled Classes
CREATE INDEX idx_scheduled_classes_timetable ON scheduled_classes(timetable_id);
CREATE INDEX idx_scheduled_classes_course ON scheduled_classes(course_id);
CREATE INDEX idx_scheduled_classes_faculty ON scheduled_classes(faculty_id);
CREATE INDEX idx_scheduled_classes_room ON scheduled_classes(room_id);
CREATE INDEX idx_scheduled_classes_day ON scheduled_classes(day_of_week);
CREATE INDEX idx_scheduled_classes_time ON scheduled_classes(start_time, end_time);

-- Conflict Logs
CREATE INDEX idx_conflict_logs_timetable ON conflict_logs(timetable_id);
CREATE INDEX idx_conflict_logs_resolved ON conflict_logs(is_resolved);
CREATE INDEX idx_conflict_logs_severity ON conflict_logs(severity);

-- =====================================================
-- TRIGGERS FOR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_academic_years_updated_at BEFORE UPDATE ON academic_years FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_semesters_updated_at BEFORE UPDATE ON semesters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON faculty FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timetable_templates_updated_at BEFORE UPDATE ON timetable_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scheduled_classes_updated_at BEFORE UPDATE ON scheduled_classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables

-- Public read access for authenticated users (can be customized later)

-- Students can only see their own data

-- Faculty can view their own data and availability

-- Admin full access (you'll need to create a role-based system)
-- For now, service_role has full access

