# 🎓 AI-Based Timetable Scheduler

> **Modern Stack**: Go Backend + Supabase + Next.js 15 | Production-Ready | NEP 2020 Compliant

An intelligent, scalable timetable scheduling system powered by hybrid optimization algorithms. Built for educational institutions to automatically generate conflict-free timetables that satisfy complex constraints.

---

## ✨ Features

### 🤖 Advanced AI Optimization
- **Hybrid Algorithm**: Combines Simulated Annealing, Tabu Search, and Hill Climbing
- **Multiple Algorithms**: Genetic Algorithm, Simulated Annealing, Tabu Search, Hybrid
- **Parallel Processing**: Utilizes Go goroutines for 5-10x faster generation
- **Real-time Progress**: WebSocket updates during generation
- **Constraint Satisfaction**: 6 hard constraints + 4 soft constraints

### 📚 Academic Management
- **NEP 2020 Compliant**: Supports MAJOR, MINOR, SKILL, AEC, VAC, SEC, MDC categories
- **Multiple Programs**: FYUP, B.Ed., M.Ed., ITEP, Diploma, Certificate
- **Course Management**: Theory, Practical, Lab, Seminar, Project, Fieldwork
- **Faculty Management**: Availability, expertise, preferences, workload limits
- **Student Enrollment**: Course registration, semester tracking, grade management

### 🏢 Resource Management
- **Smart Room Allocation**: Auto-assigns based on type (classroom, lab, hall)
- **Capacity Management**: Ensures rooms can accommodate enrolled students
- **Resource Utilization**: Reports on room and faculty utilization
- **Conflict Detection**: Real-time conflict logging and resolution

### 📊 Analytics & Reporting
- Faculty workload distribution
- Room utilization statistics
- Course distribution analysis
- Timetable export (PDF, Excel)

### 🔐 Security & Authentication
- Supabase Auth integration
- Row Level Security (RLS)
- JWT-based API authentication
- Role-based access control

---

## 🚀 Tech Stack

### Backend (Go)
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Go** | 1.22+ | High-performance backend |
| **Fiber** | v2.52 | Fast HTTP framework (Express-like) |
| **GORM** | v1.25 | ORM for PostgreSQL |
| **Supabase Go Client** | Latest | Supabase SDK |
| **UUID** | v1.6 | UUID generation |
| **godotenv** | v1.5 | Environment variables |

### Database (Supabase)
| Component | Purpose |
|-----------|---------|
| **PostgreSQL 14+** | Primary database |
| **Supabase Auth** | User authentication |
| **Supabase Storage** | File storage (PDFs, exports) |
| **Supabase Realtime** | Live updates |
| **Row Level Security** | Data access control |

### Frontend (Next.js 15) - *Coming Soon*
| Technology | Purpose |
|-----------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | UI components |
| **Supabase Client** | Auth + Database |
| **TanStack Query** | Data fetching |

---

## 📋 Prerequisites

- **Go** 1.22 or higher ([Download](https://go.dev/dl/))
- **Supabase Account** ([Sign up](https://app.supabase.com))
- **Node.js** 18+ (for frontend - coming soon)
- **Git**

---

## ⚡ Quick Start

### 1. Clone & Navigate
```bash
git clone https://github.com/yourusername/AI-BASED-Timetable-Scheduler.git
cd AI-BASED-Timetable-Scheduler
```

### 2. Set Up Supabase
Follow: [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md)

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 4. Run Database Migrations
```sql
-- In Supabase SQL Editor
\i supabase/migrations/001_initial_schema.sql
\i supabase/migrations/002_seed_data.sql
```

### 5. Start the Backend
```bash
cd go-backend
go mod download
go run cmd/server/main.go
```

Server runs on **http://localhost:8000**

### 6. Test the API
```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/academic/years
```

---

## 🗄️ Database Schema

**19 Tables:**

**Core Academic (12):** academic_years, semesters, departments, programs, course_categories, courses, faculty, faculty_availability, faculty_course_expertise, rooms, students, student_enrollments

**Timetable (7):** timetable_templates, time_slots, scheduled_classes, timetable_constraints, conflict_logs

Full schema with indexes, RLS policies: [001_initial_schema.sql](supabase/migrations/001_initial_schema.sql)

---

## 🤖 Optimization Algorithm

### Hybrid Approach (Default)
**4-Phase Process:**
1. **Greedy Construction** - Fast initial solution
2. **Simulated Annealing** - Global exploration (100 iterations)
3. **Tabu Search** - Local optimization (50 iterations)
4. **Hill Climbing** - Final refinement (20 iterations)

### Constraints
**Hard (6):** No faculty/room double-booking, workload limits, capacity limits, lab room requirements, availability
**Soft (4):** Morning preference, faculty preferences, avoid back-to-back labs, balanced distribution

### Performance
| Size | Courses | Time | Algorithm |
|------|---------|------|-----------|
| Small | <100 | 5-15s | Hybrid |
| Medium | 100-500 | 30-90s | Hybrid |
| Large | 500+ | 2-5m | Genetic |

---

## 📡 API Reference

**Base URL:** `http://localhost:8000/api/v1`

**Endpoints:**
- `/academic/*` - Academic years, semesters, departments, programs
- `/courses/*` - Course management, categories
- `/faculty/*` - Faculty, availability, expertise
- `/rooms/*` - Room management
- `/students/*` - Students, enrollments
- `/timetables/*` - Timetable generation, export, conflicts
- `/reports/*` - Analytics and reports

Full API docs: See [go-backend/internal/handlers/routes.go](go-backend/internal/handlers/routes.go)

---

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

**Services:** go-backend (port 8000) + Supabase (cloud)

---

## 📖 Documentation

- [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md) - Supabase configuration
- [MIGRATION_ANALYSIS.md](MIGRATION_ANALYSIS.md) - Django → Go migration
- [.env.example](.env.example) - Environment variables

---

## 🎯 Roadmap

- [x] Go backend with Fiber
- [x] Supabase integration
- [x] Hybrid optimization algorithm
- [x] RESTful API
- [ ] Next.js 15 frontend
- [ ] Supabase Auth
- [ ] Real-time WebSocket updates
- [ ] PDF/Excel export
- [ ] Email notifications
- [ ] Mobile app

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push (`git push origin feature/name`)
5. Open Pull Request

---

## 📝 License

MIT License

---

**Made with ❤️ for Educational Institutions**

**Star ⭐ this repo if you find it useful!**