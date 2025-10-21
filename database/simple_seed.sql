-- Simple Seed Data for Testing Timetable Builder
-- This script adds minimal data needed to test the visual timetable builder

-- ============================================
-- ACADEMIC YEARS
-- ============================================
INSERT INTO academic_years (id, year, start_date, end_date, is_active, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', '2024-2025', '2024-08-01', '2025-05-31', true, NOW(), NOW())
ON CONFLICT (year) DO NOTHING;

-- ============================================
-- SEMESTERS
-- ============================================
INSERT INTO semesters (id, academic_year_id, name, type, semester_number, start_date, end_date, is_active, created_at, updated_at) VALUES
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Fall 2024', 'ODD', 1, '2024-08-01', '2024-12-15', true, NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Spring 2025', 'EVEN', 2, '2025-01-15', '2025-05-31', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- DEPARTMENTS
-- ============================================
INSERT INTO departments (id, name, code, created_at, updated_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Computer Science', 'CS', NOW(), NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mathematics', 'MATH', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- PROGRAMS
-- ============================================
INSERT INTO programs (id, name, code, program_type, department_id, duration_years, total_credits, created_at, updated_at) VALUES
('10101010-1010-1010-1010-101010101010', 'Bachelor of Technology in Computer Science', 'BTECH-CS', 'FYUP', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, 160, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- COURSES
-- ============================================
INSERT INTO courses (id, code, name, department_id, course_type, credits, hours_per_week, is_active, created_at, updated_at) VALUES
('c1111111-1111-1111-1111-111111111111', 'CS101', 'Introduction to Programming', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'THEORY', 4, 4, true, NOW(), NOW()),
('c2222222-2222-2222-2222-222222222222', 'CS102', 'Data Structures', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'THEORY', 4, 4, true, NOW(), NOW()),
('c3333333-3333-3333-3333-333333333333', 'CS103', 'Database Systems', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'THEORY', 4, 4, true, NOW(), NOW()),
('c4444444-4444-4444-4444-444444444444', 'CS104', 'Operating Systems', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'THEORY', 4, 4, true, NOW(), NOW()),
('c5555555-5555-5555-5555-555555555555', 'CS201', 'Web Dev Lab', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'LAB', 2, 4, true, NOW(), NOW()),
('c6666666-6666-6666-6666-666666666666', 'CS202', 'Mobile Dev Lab', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'LAB', 2, 4, true, NOW(), NOW()),
('ca333333-3333-3333-3333-333333333333', 'MATH101', 'Calculus I', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'THEORY', 3, 3, true, NOW(), NOW()),
('ca444444-4444-4444-4444-444444444444', 'MATH102', 'Linear Algebra', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'THEORY', 3, 3, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- FACULTY
-- ============================================
INSERT INTO faculty (id, employee_id, first_name, last_name, email, department_id, designation, max_hours_per_week, is_active, created_at, updated_at) VALUES
('f1111111-1111-1111-1111-111111111111', 'EMP001', 'John', 'Smith', 'john.smith@university.edu', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Professor', 20, true, NOW(), NOW()),
('f2222222-2222-2222-2222-222222222222', 'EMP002', 'Sarah', 'Johnson', 'sarah.johnson@university.edu', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Associate Professor', 18, true, NOW(), NOW()),
('f3333333-3333-3333-3333-333333333333', 'EMP003', 'Michael', 'Williams', 'michael.williams@university.edu', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Assistant Professor', 16, true, NOW(), NOW()),
('f4444444-4444-4444-4444-444444444444', 'EMP004', 'Emily', 'Brown', 'emily.brown@university.edu', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Professor', 20, true, NOW(), NOW()),
('f8888888-8888-8888-8888-888888888888', 'EMP008', 'James', 'Taylor', 'james.taylor@university.edu', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Professor', 20, true, NOW(), NOW())
ON CONFLICT (employee_id) DO NOTHING;

-- ============================================
-- FACULTY AVAILABILITY (Monday-Friday, 9 AM - 5 PM)
-- ============================================
-- Dr. John Smith
INSERT INTO faculty_availability (id, faculty_id, day_of_week, start_time, end_time) VALUES
('fav11111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 1, '09:00', '17:00'),
('fav11112-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 2, '09:00', '17:00'),
('fav11113-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 3, '09:00', '17:00'),
('fav11114-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 4, '09:00', '17:00'),
('fav11115-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 5, '09:00', '17:00')
ON CONFLICT (id) DO NOTHING;

-- Dr. Sarah Johnson
INSERT INTO faculty_availability (id, faculty_id, day_of_week, start_time, end_time) VALUES
('fav22221-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', 1, '09:00', '17:00'),
('fav22222-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', 2, '09:00', '17:00'),
('fav22223-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', 3, '09:00', '17:00'),
('fav22224-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', 4, '09:00', '17:00'),
('fav22225-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', 5, '09:00', '17:00')
ON CONFLICT (id) DO NOTHING;

-- Prof. Michael Williams (Mon-Thu)
INSERT INTO faculty_availability (id, faculty_id, day_of_week, start_time, end_time) VALUES
('fav33331-3333-3333-3333-333333333333', 'f3333333-3333-3333-3333-333333333333', 1, '10:00', '16:00'),
('fav33332-3333-3333-3333-333333333333', 'f3333333-3333-3333-3333-333333333333', 2, '10:00', '16:00'),
('fav33333-3333-3333-3333-333333333333', 'f3333333-3333-3333-3333-333333333333', 3, '10:00', '16:00'),
('fav33334-3333-3333-3333-333333333333', 'f3333333-3333-3333-3333-333333333333', 4, '10:00', '16:00')
ON CONFLICT (id) DO NOTHING;

-- Dr. Emily Brown & James Taylor (Mon-Fri)
INSERT INTO faculty_availability (id, faculty_id, day_of_week, start_time, end_time) VALUES
('fav44441-4444-4444-4444-444444444444', 'f4444444-4444-4444-4444-444444444444', 1, '09:00', '17:00'),
('fav44442-4444-4444-4444-444444444444', 'f4444444-4444-4444-4444-444444444444', 2, '09:00', '17:00'),
('fav44443-4444-4444-4444-444444444444', 'f4444444-4444-4444-4444-444444444444', 3, '09:00', '17:00'),
('fav44444-4444-4444-4444-444444444444', 'f4444444-4444-4444-4444-444444444444', 4, '09:00', '17:00'),
('fav44445-4444-4444-4444-444444444444', 'f4444444-4444-4444-4444-444444444444', 5, '09:00', '17:00'),
('fav88881-8888-8888-8888-888888888888', 'f8888888-8888-8888-8888-888888888888', 1, '09:00', '17:00'),
('fav88882-8888-8888-8888-888888888888', 'f8888888-8888-8888-8888-888888888888', 2, '09:00', '17:00'),
('fav88883-8888-8888-8888-888888888888', 'f8888888-8888-8888-8888-888888888888', 3, '09:00', '17:00'),
('fav88884-8888-8888-8888-888888888888', 'f8888888-8888-8888-8888-888888888888', 4, '09:00', '17:00'),
('fav88885-8888-8888-8888-888888888888', 'f8888888-8888-8888-8888-888888888888', 5, '09:00', '17:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FACULTY COURSE EXPERTISE
-- ============================================
INSERT INTO faculty_course_expertise (id, faculty_id, course_id, preference_level) VALUES
-- Dr. John Smith - Programming & DS
('fe111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 5),
('fe111112-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', 5),
-- Dr. Sarah Johnson - Database & Web
('fe222221-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', 5),
('fe222222-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', 'c5555555-5555-5555-5555-555555555555', 4),
-- Prof. Michael Williams - OS
('fe333331-3333-3333-3333-333333333333', 'f3333333-3333-3333-3333-333333333333', 'c4444444-4444-4444-4444-444444444444', 5),
-- Dr. Emily Brown - Mobile
('fe444441-4444-4444-4444-444444444444', 'f4444444-4444-4444-4444-444444444444', 'c6666666-6666-6666-6666-666666666666', 5),
-- Dr. James Taylor - Math
('fe888881-8888-8888-8888-888888888888', 'f8888888-8888-8888-8888-888888888888', 'ca333333-3333-3333-3333-333333333333', 5),
('fe888882-8888-8888-8888-888888888888', 'f8888888-8888-8888-8888-888888888888', 'ca444444-4444-4444-4444-444444444444', 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ROOMS
-- ============================================
INSERT INTO rooms (id, room_number, building, room_type, capacity, has_projector, has_whiteboard, is_ac, is_available, created_at, updated_at) VALUES
-- Classrooms
('r1111111-1111-1111-1111-111111111111', '101', 'Academic Block A', 'CLASSROOM', 60, true, true, true, true, NOW(), NOW()),
('r2222222-2222-2222-2222-222222222222', '102', 'Academic Block A', 'CLASSROOM', 60, true, true, true, true, NOW(), NOW()),
('r3333333-3333-3333-3333-333333333333', '103', 'Academic Block A', 'CLASSROOM', 50, true, true, false, true, NOW(), NOW()),
('r4444444-4444-4444-4444-444444444444', '201', 'Academic Block A', 'CLASSROOM', 70, true, true, true, true, NOW(), NOW()),
('r5555555-5555-5555-5555-555555555555', '202', 'Academic Block A', 'CLASSROOM', 70, true, true, true, true, NOW(), NOW()),
-- Computer Labs
('r9999999-9999-9999-9999-999999999999', 'Lab-CS1', 'Computer Center', 'LAB', 40, true, true, true, true, NOW(), NOW()),
('ra111111-1111-1111-1111-111111111111', 'Lab-CS2', 'Computer Center', 'LAB', 40, true, true, true, true, NOW(), NOW()),
('ra222222-2222-2222-2222-222222222222', 'Lab-CS3', 'Computer Center', 'LAB', 30, true, true, true, true, NOW(), NOW())
ON CONFLICT (room_number) DO NOTHING;

-- ============================================
-- STUDENTS
-- ============================================
INSERT INTO students (id, student_id, first_name, last_name, email, program_id, current_semester, admission_year, is_active, created_at, updated_at) VALUES
('s1111111-1111-1111-1111-111111111111', 'CS2024001', 'Alice', 'Cooper', 'alice.cooper@student.edu', '10101010-1010-1010-1010-101010101010', 3, 2024, true, NOW(), NOW()),
('s2222222-2222-2222-2222-222222222222', 'CS2024002', 'Bob', 'Dylan', 'bob.dylan@student.edu', '10101010-1010-1010-1010-101010101010', 3, 2024, true, NOW(), NOW()),
('s3333333-3333-3333-3333-333333333333', 'CS2024003', 'Charlie', 'Parker', 'charlie.parker@student.edu', '10101010-1010-1010-1010-101010101010', 3, 2024, true, NOW(), NOW())
ON CONFLICT (student_id) DO NOTHING;

-- Success message
SELECT 'Seed data loaded successfully! Ready to create timetables.' AS status;
SELECT
    (SELECT COUNT(*) FROM academic_years) as academic_years,
    (SELECT COUNT(*) FROM semesters) as semesters,
    (SELECT COUNT(*) FROM departments) as departments,
    (SELECT COUNT(*) FROM programs) as programs,
    (SELECT COUNT(*) FROM courses) as courses,
    (SELECT COUNT(*) FROM faculty) as faculty,
    (SELECT COUNT(*) FROM rooms) as rooms,
    (SELECT COUNT(*) FROM students) as students;
