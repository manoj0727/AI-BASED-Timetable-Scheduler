# Quick Start Guide

Get your NEP 2020 Timetable Scheduler up and running in minutes!

## Prerequisites Checklist

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed
- [ ] Redis 7+ installed

## 5-Minute Setup

### 1. Install Dependencies

```bash
# Backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
cd ..
```

### 2. Configure Database

```bash
# Create PostgreSQL database
createdb timetable_db

# Or using psql:
# psql -U postgres
# CREATE DATABASE timetable_db;
```

### 3. Set Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings (use your favorite editor)
```

Minimum required in `.env`:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=timetable_db
DB_USER=postgres
DB_PASSWORD=postgres
```

### 4. Run Migrations

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

### 5. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
python manage.py runserver
```

**Terminal 2 - Redis:**
```bash
redis-server
```

**Terminal 3 - Celery:**
```bash
cd backend
celery -A timetable_scheduler worker -l info
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm run dev
```

## Access Your Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
- **API Docs**: http://localhost:8000/api/docs

## First-Time Setup Steps

### 1. Login to Django Admin
http://localhost:8000/admin (use superuser credentials)

### 2. Create Academic Year
- Go to: Core → Academic Years → Add
- Year: "2024-2025"
- Start Date: 2024-07-01
- End Date: 2025-06-30
- Is Active: ✓

### 3. Create Semester
- Go to: Core → Semesters → Add
- Academic Year: 2024-2025
- Semester Type: ODD
- Semester Number: 1
- Start & End Dates
- Is Active: ✓

### 4. Add Department
- Go to: Core → Departments → Add
- Name: "Computer Science"
- Code: "CS"

### 5. Create Program
- Go to: Core → Programs → Add
- Name: "Four Year Undergraduate Programme"
- Code: "FYUP-CS"
- Program Type: FYUP
- Duration: 4 years
- Total Credits: 160

### 6. Add Course Category
- Go to: Core → Course Categories → Add
- Code: "MAJ", Name: "Major Course", Type: MAJOR

### 7. Add Sample Course
- Go to: Core → Courses → Add
- Code: CS101
- Name: "Introduction to Programming"
- Department: Computer Science
- Program: FYUP-CS
- Semester: 1
- Course Type: THEORY
- Credits: 4
- Theory Hours: 4

### 8. Add Faculty
- First create a Django user
- Then: Core → Faculty → Add
- Link to user
- Set Employee ID, Department, etc.
- Max Hours Per Week: 20

### 9. Set Faculty Availability
- In Faculty form, add availability inline
- Monday-Friday: 09:00-17:00

### 10. Add Faculty Course Expertise
- Link faculty to courses they can teach
- Set preference level (1-5)

### 11. Add Rooms
- Go to: Core → Rooms → Add
- Room Number: "LH-101"
- Type: CLASSROOM
- Capacity: 60

### 12. Generate Timetable

**Via Admin:**
- Go to: Timetable → Timetable Templates → Add
- Fill in details and save

**Via Frontend:**
- Open http://localhost:5173
- Navigate to Timetables → Create New
- Fill form and click Generate

## Common Commands

```bash
# Create new migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
pytest

# Install new Python package
pip install package_name
pip freeze > requirements.txt

# Install new Node package
cd frontend
npm install package_name
```

## Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is free
lsof -i :8000

# Check database connection
python manage.py dbshell
```

### Frontend won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Check if port 5173 is free
lsof -i :5173
```

### Celery not working
```bash
# Check Redis is running
redis-cli ping  # Should return PONG

# Check Celery worker logs
celery -A timetable_scheduler worker -l debug
```

### Database errors
```bash
# Reset database (WARNING: deletes all data)
python manage.py flush
python manage.py migrate
```

## Production Deployment

For production deployment:

1. Set `DEBUG=False` in `.env`
2. Generate strong `SECRET_KEY`
3. Configure production database
4. Set up proper CORS origins
5. Use Docker Compose: `docker-compose up -d`
6. Configure Nginx as reverse proxy
7. Enable HTTPS with SSL certificates

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed production setup.

## Next Steps

1. ✅ Complete initial setup
2. 📚 Read [README.md](README.md) for features overview
3. 📖 Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions
4. 🏗️ Review [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for architecture
5. 🚀 Start building your timetables!

## Getting Help

- **Documentation**: Check README and SETUP_GUIDE
- **API Docs**: http://localhost:8000/api/docs
- **Issues**: Create issue on GitHub
- **Email**: support@example.com

## Useful Resources

- Django Documentation: https://docs.djangoproject.com
- React Documentation: https://react.dev
- OR-Tools Guide: https://developers.google.com/optimization
- TailwindCSS: https://tailwindcss.com/docs

---

**Happy Scheduling! 🎓**
