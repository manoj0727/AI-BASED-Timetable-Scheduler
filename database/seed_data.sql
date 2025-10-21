-- Seed Data for AI-Based Timetable Scheduler
-- This script populates the database with sample data for testing

-- Clean existing data (in reverse order of dependencies)
TRUNCATE TABLE conflict_logs, scheduled_classes, time_slots, timetable_templates,
    enrollments, students, faculty_expertise, faculty_availability, faculty,
    courses, programs, departments, semesters, academic_years CASCADE;

-- ============================================
-- ACADEMIC YEARS
-- ============================================
INSERT INTO academic_years (id, year, start_date, end_date, is_active, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', '2024-2025', '2024-08-01', '2025-05-31', true, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', '2023-2024', '2023-08-01', '2024-05-31', false, NOW(), NOW());

-- ============================================
-- SEMESTERS
-- ============================================
INSERT INTO semesters (id, name, academic_year_id, start_date, end_date, created_at, updated_at) VALUES
('33333333-3333-3333-3333-333333333333', 'Fall 2024', '11111111-1111-1111-1111-111111111111', '2024-08-01', '2024-12-15', NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'Spring 2025', '11111111-1111-1111-1111-111111111111', '2025-01-15', '2025-05-31', NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'Fall 2023', '22222222-2222-2222-2222-222222222222', '2023-08-01', '2023-12-15', NOW(), NOW());

-- ============================================
-- DEPARTMENTS
-- ============================================
INSERT INTO departments (id, name, code, created_at, updated_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Computer Science', 'CS', NOW(), NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Electrical Engineering', 'EE', NOW(), NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Mathematics', 'MATH', NOW(), NOW()),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Physics', 'PHY', NOW(), NOW());

-- ============================================
-- PROGRAMS
-- ============================================
INSERT INTO programs (id, name, code, department_id, duration_years, created_at, updated_at) VALUES
('10101010-1010-1010-1010-101010101010', 'Bachelor of Technology in Computer Science', 'B.Tech CS', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, NOW(), NOW()),
('20202020-2020-2020-2020-202020202020', 'Bachelor of Technology in Electrical Engineering', 'B.Tech EE', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 4, NOW(), NOW()),
('30303030-3030-3030-3030-303030303030', 'Master of Computer Applications', 'MCA', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, NOW(), NOW());

-- ============================================
-- COURSES
-- ============================================
INSERT INTO courses (id, code, name, credits, theory_hours, lab_hours, department_id, is_lab, category, created_at, updated_at) VALUES
-- Computer Science Courses
('c1111111-1111-1111-1111-111111111111', 'CS101', 'Introduction to Programming', 4, 3, 2, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', false, 'Core', NOW(), NOW()),
('c2222222-2222-2222-2222-222222222222', 'CS102', 'Data Structures and Algorithms', 4, 3, 2, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', false, 'Core', NOW(), NOW()),
('c3333333-3333-3333-3333-333333333333', 'CS103', 'Database Management Systems', 4, 3, 2, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', false, 'Core', NOW(), NOW()),
('c4444444-4444-4444-4444-444444444444', 'CS104', 'Operating Systems', 4, 3, 2, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', false, 'Core', NOW(), NOW()),
('c5555555-5555-5555-5555-555555555555', 'CS105', 'Computer Networks', 4, 3, 2, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', false, 'Core', NOW(), NOW()),
('c6666666-6666-6666-6666-666666666666', 'CS201', 'Machine Learning', 4, 3, 2, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', false, 'Elective', NOW(), NOW()),
('c7777777-7777-7777-7777-777777777777', 'CS202', 'Web Development Lab', 2, 0, 4, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true, 'Lab', NOW(), NOW()),
('c8888888-8888-8888-8888-888888888888', 'CS203', 'Mobile Application Development Lab', 2, 0, 4, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true, 'Lab', NOW(), NOW()),

-- Electrical Engineering Courses
('c9999999-9999-9999-9999-999999999999', 'EE101', 'Circuit Theory', 4, 3, 2, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', false, 'Core', NOW(), NOW()),
('ca111111-1111-1111-1111-111111111111', 'EE102', 'Digital Electronics', 4, 3, 2, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', false, 'Core', NOW(), NOW()),
('ca222222-2222-2222-2222-222222222222', 'EE201', 'Electronics Lab', 2, 0, 4, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true, 'Lab', NOW(), NOW()),

-- Mathematics Courses
('ca333333-3333-3333-3333-333333333333', 'MATH101', 'Calculus I', 3, 3, 0, 'cccccccc-cccc-cccc-cccc-cccccccccccc', false, 'Core', NOW(), NOW()),
('ca444444-4444-4444-4444-444444444444', 'MATH102', 'Linear Algebra', 3, 3, 0, 'cccccccc-cccc-cccc-cccc-cccccccccccc', false, 'Core', NOW(), NOW()),
('ca555555-5555-5555-5555-555555555555', 'MATH201', 'Discrete Mathematics', 3, 3, 0, 'cccccccc-cccc-cccc-cccc-cccccccccccc', false, 'Core', NOW(), NOW()),

-- Physics Courses
('ca666666-6666-6666-6666-666666666666', 'PHY101', 'Physics I', 4, 3, 2, 'dddddddd-dddd-dddd-dddd-dddddddddddd', false, 'Core', NOW(), NOW()),
('ca777777-7777-7777-7777-777777777777', 'PHY102', 'Physics Lab', 2, 0, 4, 'dddddddd-dddd-dddd-dddd-dddddddddddd', true, 'Lab', NOW(), NOW());

-- ============================================
-- FACULTY
-- ============================================
INSERT INTO faculty (id, employee_id, first_name, last_name, email, phone, department_id, designation, max_hours_per_week, created_at, updated_at) VALUES
-- CS Faculty
('f1111111-1111-1111-1111-111111111111', 'EMP001', 'Dr. John', 'Smith', 'john.smith@university.edu', '555-0101', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Professor', 20, NOW(), NOW()),
('f2222222-2222-2222-2222-222222222222', 'EMP002', 'Dr. Sarah', 'Johnson', 'sarah.johnson@university.edu', '555-0102', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Associate Professor', 18, NOW(), NOW()),
('f3333333-3333-3333-3333-333333333333', 'EMP003', 'Prof. Michael', 'Williams', 'michael.williams@university.edu', '555-0103', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Assistant Professor', 16, NOW(), NOW()),
('f4444444-4444-4444-4444-444444444444', 'EMP004', 'Dr. Emily', 'Brown', 'emily.brown@university.edu', '555-0104', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Professor', 20, NOW(), NOW()),
('f5555555-5555-5555-5555-555555555555', 'EMP005', 'Prof. David', 'Martinez', 'david.martinez@university.edu', '555-0105', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Assistant Professor', 16, NOW(), NOW()),

-- EE Faculty
('f6666666-6666-6666-6666-666666666666', 'EMP006', 'Dr. Robert', 'Garcia', 'robert.garcia@university.edu', '555-0106', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Professor', 20, NOW(), NOW()),
('f7777777-7777-7777-7777-777777777777', 'EMP007', 'Prof. Lisa', 'Anderson', 'lisa.anderson@university.edu', '555-0107', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Associate Professor', 18, NOW(), NOW()),

-- Math Faculty
('f8888888-8888-8888-8888-888888888888', 'EMP008', 'Dr. James', 'Taylor', 'james.taylor@university.edu', '555-0108', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Professor', 20, NOW(), NOW()),
('f9999999-9999-9999-9999-999999999999', 'EMP009', 'Prof. Maria', 'Thomas', 'maria.thomas@university.edu', '555-0109', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Assistant Professor', 16, NOW(), NOW()),

-- Physics Faculty
('fa111111-1111-1111-1111-111111111111', 'EMP010', 'Dr. William', 'Moore', 'william.moore@university.edu', '555-0110', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Professor', 20, NOW(), NOW());

-- ============================================
-- FACULTY AVAILABILITY (Monday-Friday, 9 AM - 5 PM)
-- ============================================
INSERT INTO faculty_availability (id, faculty_id, day_of_week, start_time, end_time, created_at, updated_at) VALUES
-- Dr. John Smith (Mon-Fri, 9-5)
('fav11111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 1, '09:00', '17:00', NOW(), NOW()),
('fav11112-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 2, '09:00', '17:00', NOW(), NOW()),
('fav11113-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 3, '09:00', '17:00', NOW(), NOW()),
('fav11114-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 4, '09:00', '17:00', NOW(), NOW()),
('fav11115-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 5, '09:00', '17:00', NOW(), NOW()),

-- Dr. Sarah Johnson (Mon-Fri, 9-5)
('fav22221-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', 1, '09:00', '17:00', NOW(), NOW()),
('fav22222-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', 2, '09:00', '17:00', NOW(), NOW()),
('fav22223-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', 3, '09:00', '17:00', NOW(), NOW()),
('fav22224-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', 4, '09:00', '17:00', NOW(), NOW()),
('fav22225-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', 5, '09:00', '17:00', NOW(), NOW()),

-- Prof. Michael Williams (Mon-Thu, 10-4)
('fav33331-3333-3333-3333-333333333333', 'f3333333-3333-3333-3333-333333333333', 1, '10:00', '16:00', NOW(), NOW()),
('fav33332-3333-3333-3333-333333333333', 'f3333333-3333-3333-3333-333333333333', 2, '10:00', '16:00', NOW(), NOW()),
('fav33333-3333-3333-3333-333333333333', 'f3333333-3333-3333-3333-333333333333', 3, '10:00', '16:00', NOW(), NOW()),
('fav33334-3333-3333-3333-333333333333', 'f3333333-3333-3333-3333-333333333333', 4, '10:00', '16:00', NOW(), NOW()),

-- Add availability for other faculty members (similar pattern)
('fav44441-4444-4444-4444-444444444444', 'f4444444-4444-4444-4444-444444444444', 1, '09:00', '17:00', NOW(), NOW()),
('fav44442-4444-4444-4444-444444444444', 'f4444444-4444-4444-4444-444444444444', 2, '09:00', '17:00', NOW(), NOW()),
('fav44443-4444-4444-4444-444444444444', 'f4444444-4444-4444-4444-444444444444', 3, '09:00', '17:00', NOW(), NOW()),
('fav44444-4444-4444-4444-444444444444', 'f4444444-4444-4444-4444-444444444444', 4, '09:00', '17:00', NOW(), NOW()),
('fav44445-4444-4444-4444-444444444444', 'f4444444-4444-4444-4444-444444444444', 5, '09:00', '17:00', NOW(), NOW());

-- ============================================
-- FACULTY EXPERTISE
-- ============================================
INSERT INTO faculty_expertise (id, faculty_id, course_id, preference_level, created_at, updated_at) VALUES
-- Dr. John Smith - Programming & Algorithms
('fe111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 5, NOW(), NOW()),
('fe111112-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', 5, NOW(), NOW()),

-- Dr. Sarah Johnson - Database & Web Dev
('fe222221-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', 5, NOW(), NOW()),
('fe222222-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', 'c7777777-7777-7777-7777-777777777777', 4, NOW(), NOW()),

-- Prof. Michael Williams - OS & Networks
('fe333331-3333-3333-3333-333333333333', 'f3333333-3333-3333-3333-333333333333', 'c4444444-4444-4444-4444-444444444444', 5, NOW(), NOW()),
('fe333332-3333-3333-3333-333333333333', 'f3333333-3333-3333-3333-333333333333', 'c5555555-5555-5555-5555-555555555555', 5, NOW(), NOW()),

-- Dr. Emily Brown - Machine Learning
('fe444441-4444-4444-4444-444444444444', 'f4444444-4444-4444-4444-444444444444', 'c6666666-6666-6666-6666-666666666666', 5, NOW(), NOW()),

-- Prof. David Martinez - Mobile Dev
('fe555551-5555-5555-5555-555555555555', 'f5555555-5555-5555-5555-555555555555', 'c8888888-8888-8888-8888-888888888888', 5, NOW(), NOW()),

-- Dr. Robert Garcia - Circuit Theory
('fe666661-6666-6666-6666-666666666666', 'f6666666-6666-6666-6666-666666666666', 'c9999999-9999-9999-9999-999999999999', 5, NOW(), NOW()),

-- Prof. Lisa Anderson - Digital Electronics
('fe777771-7777-7777-7777-777777777777', 'f7777777-7777-7777-7777-777777777777', 'ca111111-1111-1111-1111-111111111111', 5, NOW(), NOW()),
('fe777772-7777-7777-7777-777777777777', 'f7777777-7777-7777-7777-777777777777', 'ca222222-2222-2222-2222-222222222222', 4, NOW(), NOW()),

-- Dr. James Taylor - Math
('fe888881-8888-8888-8888-888888888888', 'f8888888-8888-8888-8888-888888888888', 'ca333333-3333-3333-3333-333333333333', 5, NOW(), NOW()),
('fe888882-8888-8888-8888-888888888888', 'f8888888-8888-8888-8888-888888888888', 'ca444444-4444-4444-4444-444444444444', 5, NOW(), NOW()),

-- Prof. Maria Thomas - Discrete Math
('fe999991-9999-9999-9999-999999999999', 'f9999999-9999-9999-9999-999999999999', 'ca555555-5555-5555-5555-555555555555', 5, NOW(), NOW()),

-- Dr. William Moore - Physics
('fea11111-1111-1111-1111-111111111111', 'fa111111-1111-1111-1111-111111111111', 'ca666666-6666-6666-6666-666666666666', 5, NOW(), NOW()),
('fea11112-1111-1111-1111-111111111111', 'fa111111-1111-1111-1111-111111111111', 'ca777777-7777-7777-7777-777777777777', 4, NOW(), NOW());

-- ============================================
-- ROOMS
-- ============================================
INSERT INTO rooms (id, room_number, building, capacity, is_lab, features, created_at, updated_at) VALUES
-- Classrooms
('r1111111-1111-1111-1111-111111111111', '101', 'Academic Block A', 60, false, '{Projector,Whiteboard,AC}', NOW(), NOW()),
('r2222222-2222-2222-2222-222222222222', '102', 'Academic Block A', 60, false, '{Projector,Whiteboard,AC}', NOW(), NOW()),
('r3333333-3333-3333-3333-333333333333', '103', 'Academic Block A', 50, false, '{Projector,Whiteboard}', NOW(), NOW()),
('r4444444-4444-4444-4444-444444444444', '201', 'Academic Block A', 70, false, '{Projector,Whiteboard,AC,SmartBoard}', NOW(), NOW()),
('r5555555-5555-5555-5555-555555555555', '202', 'Academic Block A', 70, false, '{Projector,Whiteboard,AC,SmartBoard}', NOW(), NOW()),
('r6666666-6666-6666-6666-666666666666', '301', 'Academic Block B', 50, false, '{Projector,Whiteboard,AC}', NOW(), NOW()),
('r7777777-7777-7777-7777-777777777777', '302', 'Academic Block B', 50, false, '{Projector,Whiteboard,AC}', NOW(), NOW()),
('r8888888-8888-8888-8888-888888888888', '401', 'Academic Block B', 40, false, '{Projector,Whiteboard}', NOW(), NOW()),

-- Computer Labs
('r9999999-9999-9999-9999-999999999999', 'Lab-CS1', 'Computer Center', 40, true, '{Computers,Projector,AC,Internet}', NOW(), NOW()),
('ra111111-1111-1111-1111-111111111111', 'Lab-CS2', 'Computer Center', 40, true, '{Computers,Projector,AC,Internet}', NOW(), NOW()),
('ra222222-2222-2222-2222-222222222222', 'Lab-CS3', 'Computer Center', 30, true, '{Computers,Projector,AC,Internet}', NOW(), NOW()),

-- Electronics Labs
('ra333333-3333-3333-3333-333333333333', 'Lab-EE1', 'Engineering Block', 30, true, '{Workbenches,Oscilloscopes,AC}', NOW(), NOW()),
('ra444444-4444-4444-4444-444444444444', 'Lab-EE2', 'Engineering Block', 30, true, '{Workbenches,Oscilloscopes,AC}', NOW(), NOW()),

-- Physics Labs
('ra555555-5555-5555-5555-555555555555', 'Lab-PHY1', 'Science Block', 30, true, '{Equipment,Workbenches,AC}', NOW(), NOW());

-- ============================================
-- STUDENTS
-- ============================================
INSERT INTO students (id, roll_number, first_name, last_name, email, phone, program_id, semester, admission_year, created_at, updated_at) VALUES
-- B.Tech CS Students
('s1111111-1111-1111-1111-111111111111', 'CS2024001', 'Alice', 'Cooper', 'alice.cooper@student.edu', '555-1001', '10101010-1010-1010-1010-101010101010', 3, 2024, NOW(), NOW()),
('s2222222-2222-2222-2222-222222222222', 'CS2024002', 'Bob', 'Dylan', 'bob.dylan@student.edu', '555-1002', '10101010-1010-1010-1010-101010101010', 3, 2024, NOW(), NOW()),
('s3333333-3333-3333-3333-333333333333', 'CS2024003', 'Charlie', 'Parker', 'charlie.parker@student.edu', '555-1003', '10101010-1010-1010-1010-101010101010', 3, 2024, NOW(), NOW()),
('s4444444-4444-4444-4444-444444444444', 'CS2024004', 'Diana', 'Ross', 'diana.ross@student.edu', '555-1004', '10101010-1010-1010-1010-101010101010', 3, 2024, NOW(), NOW()),
('s5555555-5555-5555-5555-555555555555', 'CS2024005', 'Ethan', 'Hunt', 'ethan.hunt@student.edu', '555-1005', '10101010-1010-1010-1010-101010101010', 3, 2024, NOW(), NOW()),

-- B.Tech EE Students
('s6666666-6666-6666-6666-666666666666', 'EE2024001', 'Frank', 'Sinatra', 'frank.sinatra@student.edu', '555-1006', '20202020-2020-2020-2020-202020202020', 3, 2024, NOW(), NOW()),
('s7777777-7777-7777-7777-777777777777', 'EE2024002', 'Grace', 'Kelly', 'grace.kelly@student.edu', '555-1007', '20202020-2020-2020-2020-202020202020', 3, 2024, NOW(), NOW()),

-- MCA Students
('s8888888-8888-8888-8888-888888888888', 'MCA2024001', 'Henry', 'Ford', 'henry.ford@student.edu', '555-1008', '30303030-3030-3030-3030-303030303030', 1, 2024, NOW(), NOW()),
('s9999999-9999-9999-9999-999999999999', 'MCA2024002', 'Iris', 'West', 'iris.west@student.edu', '555-1009', '30303030-3030-3030-3030-303030303030', 1, 2024, NOW(), NOW());

-- ============================================
-- ENROLLMENTS (Student Course Registrations)
-- ============================================
INSERT INTO enrollments (id, student_id, course_id, semester_id, enrollment_date, created_at, updated_at) VALUES
-- Alice Cooper enrollments
('e1111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '2024-07-15', NOW(), NOW()),
('e1111112-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', 'c4444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', '2024-07-15', NOW(), NOW()),
('e1111113-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', 'c5555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', '2024-07-15', NOW(), NOW()),

-- Bob Dylan enrollments
('e2222221-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '2024-07-15', NOW(), NOW()),
('e2222222-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222222', 'c4444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', '2024-07-15', NOW(), NOW()),
('e2222223-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222222', 'c6666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', '2024-07-15', NOW(), NOW());

-- ============================================
-- TIME SLOTS
-- ============================================
INSERT INTO time_slots (id, name, start_time, end_time, created_at, updated_at) VALUES
('t1111111-1111-1111-1111-111111111111', '9:00 AM - 10:00 AM', '09:00', '10:00', NOW(), NOW()),
('t2222222-2222-2222-2222-222222222222', '10:00 AM - 11:00 AM', '10:00', '11:00', NOW(), NOW()),
('t3333333-3333-3333-3333-333333333333', '11:00 AM - 12:00 PM', '11:00', '12:00', NOW(), NOW()),
('t4444444-4444-4444-4444-444444444444', '12:00 PM - 1:00 PM', '12:00', '13:00', NOW(), NOW()),
('t5555555-5555-5555-5555-555555555555', '1:00 PM - 2:00 PM', '13:00', '14:00', NOW(), NOW()),
('t6666666-6666-6666-6666-666666666666', '2:00 PM - 3:00 PM', '14:00', '15:00', NOW(), NOW()),
('t7777777-7777-7777-7777-777777777777', '3:00 PM - 4:00 PM', '15:00', '16:00', NOW(), NOW()),
('t8888888-8888-8888-8888-888888888888', '4:00 PM - 5:00 PM', '16:00', '17:00', NOW(), NOW());

-- Success message
SELECT 'Seed data inserted successfully!' AS status;
