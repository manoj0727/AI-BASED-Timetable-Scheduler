-- =====================================================
-- Seed Data for AI-Based Timetable Scheduler
-- =====================================================

-- Insert Course Categories (NEP 2020 compliant)
INSERT INTO course_categories (code, name, description) VALUES
('MAJOR', 'Major Course', 'Primary subject courses for specialization'),
('MINOR', 'Minor Course', 'Secondary subject courses'),
('SKILL', 'Skill Enhancement Course', 'Practical skill-based courses'),
('AEC', 'Ability Enhancement Course', 'Courses to enhance abilities like communication, critical thinking'),
('VAC', 'Value Added Course', 'Courses adding value beyond curriculum'),
('SEC', 'Skill Enhancement Compulsory', 'Mandatory skill courses'),
('MDC', 'Multi-Disciplinary Course', 'Courses from multiple disciplines'),
('FOUNDATION', 'Foundation Course', 'Basic foundational courses'),
('CORE', 'Core Course', 'Core subject courses'),
('ELECTIVE', 'Elective Course', 'Optional courses students can choose')
ON CONFLICT (code) DO NOTHING;

-- Insert Sample Department
INSERT INTO departments (name, code, description, head_of_department) VALUES
('Computer Science', 'CS', 'Department of Computer Science and Engineering', 'Dr. John Smith'),
('Mathematics', 'MATH', 'Department of Mathematics', 'Dr. Jane Doe'),
('Physics', 'PHY', 'Department of Physics', 'Dr. Robert Johnson'),
('Education', 'EDU', 'Department of Education', 'Dr. Emily Brown')
ON CONFLICT (code) DO NOTHING;

-- Insert Sample Programs
INSERT INTO programs (name, code, program_type, department_id, duration_years, total_credits, description)
SELECT
    'Four Year Undergraduate Programme - Computer Science',
    'FYUP-CS',
    'FYUP',
    d.id,
    4,
    160,
    'Four-year undergraduate program in Computer Science as per NEP 2020'
FROM departments d WHERE d.code = 'CS'
ON CONFLICT (code) DO NOTHING;

INSERT INTO programs (name, code, program_type, department_id, duration_years, total_credits, description)
SELECT
    'Bachelor of Education',
    'B-ED',
    'B_ED',
    d.id,
    2,
    100,
    'Two-year Bachelor of Education program'
FROM departments d WHERE d.code = 'EDU'
ON CONFLICT (code) DO NOTHING;

-- Insert Sample Academic Year
INSERT INTO academic_years (year, start_date, end_date, is_active) VALUES
('2024-2025', '2024-07-01', '2025-06-30', true)
ON CONFLICT (year) DO NOTHING;

-- Insert Sample Semesters
INSERT INTO semesters (academic_year_id, name, type, semester_number, start_date, end_date, is_active)
SELECT
    ay.id,
    'Semester 1 (Odd)',
    'ODD',
    1,
    '2024-07-01',
    '2024-12-31',
    true
FROM academic_years ay WHERE ay.year = '2024-2025'
ON CONFLICT (academic_year_id, semester_number) DO NOTHING;

INSERT INTO semesters (academic_year_id, name, type, semester_number, start_date, end_date, is_active)
SELECT
    ay.id,
    'Semester 2 (Even)',
    'EVEN',
    2,
    '2025-01-01',
    '2025-06-30',
    false
FROM academic_years ay WHERE ay.year = '2024-2025'
ON CONFLICT (academic_year_id, semester_number) DO NOTHING;

-- Insert Sample Courses
INSERT INTO courses (code, name, department_id, category_id, course_type, credits, hours_per_week, description, is_active)
SELECT
    'CS101',
    'Introduction to Programming',
    d.id,
    cc.id,
    'THEORY',
    4,
    4,
    'Fundamentals of programming using Python',
    true
FROM departments d, course_categories cc
WHERE d.code = 'CS' AND cc.code = 'MAJOR'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (code, name, department_id, category_id, course_type, credits, hours_per_week, description, is_active)
SELECT
    'CS102',
    'Data Structures and Algorithms',
    d.id,
    cc.id,
    'THEORY',
    4,
    4,
    'Fundamental data structures and algorithms',
    true
FROM departments d, course_categories cc
WHERE d.code = 'CS' AND cc.code = 'MAJOR'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (code, name, department_id, category_id, course_type, credits, hours_per_week, description, is_active)
SELECT
    'CS103',
    'Programming Lab',
    d.id,
    cc.id,
    'LAB',
    2,
    4,
    'Hands-on programming laboratory',
    true
FROM departments d, course_categories cc
WHERE d.code = 'CS' AND cc.code = 'SKILL'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (code, name, department_id, category_id, course_type, credits, hours_per_week, description, is_active)
SELECT
    'MATH101',
    'Calculus I',
    d.id,
    cc.id,
    'THEORY',
    4,
    4,
    'Differential and integral calculus',
    true
FROM departments d, course_categories cc
WHERE d.code = 'MATH' AND cc.code = 'FOUNDATION'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (code, name, department_id, category_id, course_type, credits, hours_per_week, description, is_active)
SELECT
    'PHY101',
    'Physics I',
    d.id,
    cc.id,
    'THEORY',
    3,
    3,
    'Mechanics and thermodynamics',
    true
FROM departments d, course_categories cc
WHERE d.code = 'PHY' AND cc.code = 'FOUNDATION'
ON CONFLICT (code) DO NOTHING;

-- Insert Sample Rooms
INSERT INTO rooms (room_number, building, floor, room_type, capacity, has_projector, has_computer, has_whiteboard, is_available) VALUES
('LH-101', 'Main Building', 1, 'CLASSROOM', 60, true, false, true, true),
('LH-102', 'Main Building', 1, 'CLASSROOM', 60, true, false, true, true),
('LH-201', 'Main Building', 2, 'CLASSROOM', 50, true, true, true, true),
('LAB-301', 'Computer Science Block', 3, 'LAB', 30, true, true, false, true),
('LAB-302', 'Computer Science Block', 3, 'LAB', 30, true, true, false, true),
('SH-401', 'Main Building', 4, 'SEMINAR_HALL', 100, true, true, true, true),
('AUD-001', 'Auditorium Block', 1, 'AUDITORIUM', 300, true, true, false, true)
ON CONFLICT (room_number) DO NOTHING;

-- Note: Faculty and Students data should NOT be seeded here
-- They will be created through Supabase Auth and linked via user_id

COMMENT ON TABLE course_categories IS 'NEP 2020 compliant course categories with seed data';
COMMENT ON TABLE departments IS 'Sample departments for testing';
COMMENT ON TABLE programs IS 'Sample academic programs';
