# Project Structure

```
AI-BASED-Timetable-Scheduler/
├── backend/                          # Django Backend
│   ├── manage.py                     # Django management script
│   ├── timetable_scheduler/          # Main Django project
│   │   ├── __init__.py
│   │   ├── settings.py               # Django settings
│   │   ├── urls.py                   # Main URL configuration
│   │   ├── wsgi.py                   # WSGI config
│   │   └── celery.py                 # Celery configuration
│   ├── core/                         # Core models app
│   │   ├── models.py                 # Academic entities (Programs, Courses, Faculty, Rooms)
│   │   ├── serializers.py            # DRF serializers
│   │   ├── views.py                  # API views
│   │   ├── urls.py                   # URL routing
│   │   ├── admin.py                  # Admin configuration
│   │   └── apps.py
│   ├── timetable/                    # Timetable management app
│   │   ├── models.py                 # Timetable entities (Templates, Slots, Schedules)
│   │   ├── serializers.py            # DRF serializers
│   │   ├── views.py                  # API views
│   │   ├── urls.py                   # URL routing
│   │   ├── admin.py                  # Admin configuration
│   │   ├── tasks.py                  # Celery tasks
│   │   └── apps.py
│   ├── optimization/                 # Optimization engines
│   │   ├── engine.py                 # OR-Tools implementation
│   │   ├── genetic_algorithm.py     # Genetic Algorithm implementation
│   │   ├── services.py               # Service layer
│   │   ├── views.py                  # Task status API
│   │   ├── urls.py
│   │   └── apps.py
│   └── Dockerfile                    # Backend Docker config
│
├── frontend/                         # React Frontend
│   ├── public/                       # Static assets
│   ├── src/
│   │   ├── main.tsx                  # App entry point
│   │   ├── App.tsx                   # Root component with routing
│   │   ├── index.css                 # Global styles with Tailwind
│   │   ├── components/
│   │   │   └── Layout.tsx            # Main layout with sidebar
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx         # Dashboard page
│   │   │   ├── Programs.tsx          # Programs management
│   │   │   ├── Courses.tsx           # Courses management
│   │   │   ├── Faculty.tsx           # Faculty management
│   │   │   ├── Rooms.tsx             # Rooms management
│   │   │   ├── Students.tsx          # Students management
│   │   │   ├── TimetableList.tsx     # List all timetables
│   │   │   ├── TimetableCreate.tsx   # Create new timetable
│   │   │   └── TimetableView.tsx     # View/edit timetable
│   │   └── api/                      # API client (to be implemented)
│   ├── index.html
│   ├── vite.config.ts                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── tsconfig.json                 # TypeScript config
│   ├── package.json
│   └── Dockerfile                    # Frontend Docker config
│
├── .env.example                      # Example environment variables
├── .gitignore                        # Git ignore rules
├── requirements.txt                  # Python dependencies
├── docker-compose.yml                # Docker Compose configuration
├── README.md                         # Main documentation
├── SETUP_GUIDE.md                    # Detailed setup instructions
└── PROJECT_STRUCTURE.md              # This file

```

## Key Components

### Backend Apps

#### 1. Core App
- **Purpose**: Foundational academic entities
- **Models**: AcademicYear, Semester, Program, Department, Course, Faculty, Room, Student
- **Responsibilities**:
  - Academic structure management
  - Faculty and room resource management
  - Course and enrollment tracking

#### 2. Timetable App
- **Purpose**: Timetable generation and management
- **Models**: TimetableTemplate, TimeSlot, ScheduledClass, Constraint, ConflictLog
- **Responsibilities**:
  - Timetable template configuration
  - Schedule generation orchestration
  - Conflict detection and logging
  - Teaching practice and fieldwork scheduling

#### 3. Optimization App
- **Purpose**: AI-powered schedule optimization
- **Components**:
  - OR-Tools CP-SAT Solver engine
  - Genetic Algorithm engine
  - Service layer for coordination
- **Responsibilities**:
  - Constraint modeling
  - Schedule optimization
  - Conflict resolution

### Frontend Structure

#### Components
- **Layout**: Main application layout with navigation
- **Pages**: Route-specific page components
- **API Client**: Backend API communication (to be implemented)

#### Pages
- **Dashboard**: Overview and statistics
- **Resource Management**: Programs, Courses, Faculty, Rooms, Students
- **Timetable Management**: Create, view, edit timetables

## Data Flow

1. **Input Phase**:
   - Admin enters academic structure via Django Admin
   - Faculty, rooms, courses configured
   - Student enrollments recorded

2. **Generation Phase**:
   - User creates timetable template with parameters
   - Triggers async generation via API
   - Celery worker processes optimization
   - OR-Tools/GA generates conflict-free schedule

3. **Review Phase**:
   - Generated timetable displayed in frontend
   - Conflicts highlighted (if any)
   - Manual adjustments possible
   - Re-generation available

4. **Publication Phase**:
   - Approved timetable published
   - Export to PDF/Excel
   - Distribution to stakeholders

## Technology Stack

### Backend
- **Framework**: Django 5.0 + DRF
- **Database**: PostgreSQL 14+
- **Task Queue**: Celery + Redis
- **Optimization**: OR-Tools, DEAP
- **API Docs**: drf-spectacular (OpenAPI)

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Query
- **Routing**: React Router v6
- **Calendar**: FullCalendar

### DevOps
- **Containerization**: Docker + Docker Compose
- **WSGI Server**: Gunicorn (production)
- **Reverse Proxy**: Nginx (production)

## API Endpoints

### Core API (`/api/core/`)
- `/academic-years/` - Academic years
- `/semesters/` - Semesters
- `/programs/` - Programs
- `/departments/` - Departments
- `/courses/` - Courses
- `/faculty/` - Faculty members
- `/rooms/` - Rooms
- `/students/` - Students
- `/enrollments/` - Course enrollments

### Timetable API (`/api/timetable/`)
- `/templates/` - Timetable templates
- `/templates/{id}/generate/` - Trigger generation
- `/templates/{id}/publish/` - Publish timetable
- `/templates/{id}/export/` - Export timetable
- `/scheduled-classes/` - Scheduled classes
- `/conflicts/` - Conflict logs

### Optimization API (`/api/optimization/`)
- `/status/{task_id}/` - Check task status

## Database Models

### Core Models (16 tables)
- AcademicYear, Semester, Program, Department
- CourseCategory, Course
- Faculty, FacultyAvailability, FacultyCourseExpertise
- Room
- Student, StudentCourseEnrollment

### Timetable Models (7 tables)
- TimetableTemplate, TimeSlot, ScheduledClass
- TimetableConstraint, ConflictLog
- TeachingPracticeSchedule, FieldworkSchedule

## Configuration Files

- **Backend**:
  - `settings.py` - Django settings
  - `celery.py` - Async task configuration
  - `requirements.txt` - Python dependencies

- **Frontend**:
  - `vite.config.ts` - Build configuration
  - `tailwind.config.js` - CSS framework config
  - `tsconfig.json` - TypeScript settings
  - `package.json` - Node dependencies

- **Deployment**:
  - `docker-compose.yml` - Multi-container setup
  - `Dockerfile` (backend & frontend)
  - `.env.example` - Environment template

## Development Workflow

1. **Backend Development**:
   ```bash
   cd backend
   python manage.py runserver
   celery -A timetable_scheduler worker -l info
   ```

2. **Frontend Development**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Full Stack Development**:
   ```bash
   docker-compose up
   ```

## Future Enhancements

- Add ML-based enrollment prediction
- Implement real-time WebSocket notifications
- Create mobile app (React Native)
- Add advanced analytics dashboard
- Integrate with external LMS platforms
- Multi-campus support
- Automated backup and restore
- Performance monitoring
- Advanced reporting system
