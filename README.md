# NEP 2020 AI-Based Timetable Scheduler

An intelligent, automated timetable generation system designed specifically for Higher Education Institutions implementing NEP 2020 guidelines. Supports FYUP, B.Ed., M.Ed., and ITEP programs with flexible credit-based structures.

## 🎯 Features

### Core Capabilities
- **NEP 2020 Compliance**: Supports Major, Minor, Skill-Based, AEC, VAC, and SEC courses
- **Multi-Program Support**: FYUP, B.Ed., M.Ed., ITEP programs
- **AI-Powered Optimization**: Uses OR-Tools and Genetic Algorithms for conflict-free scheduling
- **Constraint Programming**: Hard and soft constraints for flexible timetable generation
- **Real-Time Conflict Detection**: Automatically identifies and resolves scheduling conflicts
- **Dynamic Editing**: Modify and regenerate timetables on-the-fly
- **Export Functionality**: PDF and Excel export for distribution

### Advanced Features
- Faculty workload management and availability tracking
- Room capacity and type-based allocation
- Teaching practice and fieldwork scheduling
- Student course enrollment and elective management
- Multi-semester planning
- Batch division support for large classes
- Customizable time slots and break periods

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Python 3.11+ with Django 5.0
- Django REST Framework for API
- PostgreSQL for database
- Google OR-Tools for constraint programming
- DEAP for genetic algorithms
- Celery + Redis for async task processing

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Query for data fetching
- FullCalendar for visualization
- React Router for navigation

## 📦 Installation

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed installation instructions.

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd AI-BASED-Timetable-Scheduler

# Backend setup
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev
```

## 🚀 Usage

1. Access Django Admin at http://localhost:8000/admin
2. Set up Academic Year, Programs, Departments, Courses, Faculty, and Rooms
3. Navigate to frontend at http://localhost:5173
4. Create a new timetable template
5. Click "Generate" to create optimized schedule
6. Review, edit, and publish timetable

## 📊 Database Schema

Comprehensive models for:
- Academic structure (Years, Semesters, Programs, Departments)
- Courses with NEP 2020 categories
- Faculty with expertise and availability
- Rooms and facilities
- Student enrollments
- Timetable templates and schedules

## 🧠 Optimization Engine

Two optimization approaches:

1. **OR-Tools CP-SAT Solver** (Default)
   - Best for small to medium institutions
   - Guarantees optimal solutions
   - Fast for < 500 courses

2. **Genetic Algorithm (DEAP)**
   - Best for large institutions
   - Scales well with complexity
   - Handles > 500 courses efficiently

### Constraints

**Hard Constraints (Must satisfy):**
- No faculty/room double-booking
- Faculty qualification matching
- Room capacity limits
- Lab room requirements
- Faculty workload limits

**Soft Constraints (Preferences):**
- Morning slots for theory classes
- Faculty course preferences
- Avoid back-to-back practicals
- Balanced daily distribution

## 📱 API Documentation

Interactive API documentation: http://localhost:8000/api/docs/

## 🔐 Authentication

JWT-based authentication for API access.

## 🚢 Deployment

Docker deployment supported via [docker-compose.yml](docker-compose.yml)

```bash
docker-compose up -d
```

## 📝 Documentation

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup instructions
- [API Documentation](http://localhost:8000/api/docs/) - Interactive API docs

## 🎓 NEP 2020 Compliance

Fully compliant with NEP 2020 guidelines:
- Flexible credit-based system
- Multidisciplinary approach
- Choice-based credit system (CBCS)
- Multiple entry/exit points

## 📈 Roadmap

- [ ] Mobile app for faculty and students
- [ ] Real-time notifications
- [ ] AI-based enrollment prediction
- [ ] Multi-campus support
- [ ] Advanced analytics dashboard
- [ ] Integration with LMS platforms

## 🤝 Contributing

Contributions welcome! Please fork and submit pull requests.

## 📄 License

MIT License

---

**Built for Higher Education Institutions implementing NEP 2020**