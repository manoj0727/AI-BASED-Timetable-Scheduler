# Complete Setup Guide

This guide will walk you through setting up the NEP 2020 Timetable Scheduler from scratch.

## System Requirements

### Hardware Requirements
- **Minimum**: 4GB RAM, 2 CPU cores, 20GB disk space
- **Recommended**: 8GB RAM, 4 CPU cores, 50GB disk space

### Software Requirements
- **Operating System**: Linux, macOS, or Windows 10+
- **Python**: 3.11 or higher
- **Node.js**: 18.x or higher
- **PostgreSQL**: 14.x or higher
- **Redis**: 7.x or higher

## Step-by-Step Installation

### Part 1: System Dependencies

#### On Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install Python 3.11
sudo apt install python3.11 python3.11-venv python3.11-dev

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Redis
sudo apt install redis-server

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install build tools
sudo apt install build-essential libpq-dev
```

#### On macOS
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python
brew install python@3.11

# Install PostgreSQL
brew install postgresql@14
brew services start postgresql@14

# Install Redis
brew install redis
brew services start redis

# Install Node.js
brew install node@18
```

#### On Windows
1. Download and install Python 3.11 from python.org
2. Download and install PostgreSQL from postgresql.org
3. Download and install Redis from redis.io/download
4. Download and install Node.js from nodejs.org

### Part 2: Project Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd AI-BASED-Timetable-Scheduler
```

#### 2. Backend Setup

```bash
# Create virtual environment
python3.11 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

#### 3. Database Setup

```bash
# Start PostgreSQL service (if not already running)
# On Ubuntu:
sudo systemctl start postgresql
# On macOS:
brew services start postgresql@14

# Create database user and database
sudo -u postgres psql

# In psql:
CREATE USER timetable_user WITH PASSWORD 'your_password';
CREATE DATABASE timetable_db OWNER timetable_user;
GRANT ALL PRIVILEGES ON DATABASE timetable_db TO timetable_user;
\q
```

#### 4. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your settings
nano .env  # or use your preferred editor
```

Update the following in `.env`:
```env
SECRET_KEY=your-generated-secret-key-here
DEBUG=True
DB_NAME=timetable_db
DB_USER=timetable_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

Generate a secret key:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

#### 5. Run Migrations

```bash
cd backend

# Run migrations
python manage.py migrate

# Create superuser for admin access
python manage.py createsuperuser

# Create initial data (optional)
python manage.py loaddata fixtures/initial_data.json
```

#### 6. Start Backend Services

**Terminal 1 - Django Server:**
```bash
cd backend
source ../venv/bin/activate  # On Windows: ..\venv\Scripts\activate
python manage.py runserver
```

**Terminal 2 - Redis:**
```bash
redis-server
```

**Terminal 3 - Celery Worker:**
```bash
cd backend
source ../venv/bin/activate
celery -A timetable_scheduler worker --loglevel=info
```

#### 7. Frontend Setup

**Terminal 4 - Frontend:**
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Part 3: Initial Data Setup

#### 1. Access Django Admin
Navigate to http://localhost:8000/admin and login with your superuser credentials.

#### 2. Create Academic Structure

**Academic Year:**
- Year: "2024-2025"
- Start Date: 2024-07-01
- End Date: 2025-06-30
- Is Active: ✓

**Semester:**
- Academic Year: 2024-2025
- Semester Type: ODD
- Semester Number: 1
- Start Date: 2024-07-01
- End Date: 2024-12-31
- Is Active: ✓

**Department:**
- Name: "Computer Science"
- Code: "CS"

**Program:**
- Name: "Four Year Undergraduate Programme"
- Code: "FYUP-CS"
- Program Type: FYUP
- Duration Years: 4
- Total Credits: 160
- Is Active: ✓

**Course Categories:**
| Code | Name | Type |
|------|------|------|
| MAJ | Major Course | MAJOR |
| MIN | Minor Course | MINOR |
| SKILL | Skill-Based Course | SKILL |
| AEC | Ability Enhancement Course | AEC |
| VAC | Value-Added Course | VAC |

#### 3. Add Sample Courses

```
Course 1:
- Code: CS101
- Name: Introduction to Programming
- Department: Computer Science
- Category: Major Course
- Course Type: HYBRID
- Credits: 4
- Theory Hours: 3
- Practical Hours: 2
- Program: FYUP-CS
- Semester: 1
- Max Students: 60

Course 2:
- Code: CS102
- Name: Data Structures
- Department: Computer Science
- Category: Major Course
- Course Type: THEORY
- Credits: 4
- Theory Hours: 4
- Practical Hours: 0
- Program: FYUP-CS
- Semester: 1
- Max Students: 60
```

#### 4. Add Faculty Members

First create Django users for faculty, then:

```
Faculty 1:
- User: [Select created user]
- Employee ID: FAC001
- Department: Computer Science
- Designation: Assistant Professor
- Specialization: Programming
- Max Hours Per Week: 20
- Email: faculty1@example.com
- Is Active: ✓
```

#### 5. Set Faculty Availability

For each faculty, add availability:
```
Monday: 09:00 - 17:00
Tuesday: 09:00 - 17:00
Wednesday: 09:00 - 17:00
Thursday: 09:00 - 17:00
Friday: 09:00 - 17:00
```

#### 6. Map Faculty Course Expertise

Link faculty to courses they can teach with preference level (1-5).

#### 7. Add Rooms

```
Room 1:
- Name: Lecture Hall 1
- Room Number: LH-101
- Room Type: CLASSROOM
- Capacity: 60
- Building: Main Building
- Floor: 1
- Has Projector: ✓
- Is Available: ✓

Room 2:
- Name: Computer Lab 1
- Room Number: LAB-201
- Room Type: LAB
- Capacity: 30
- Building: CS Block
- Floor: 2
- Has Computer: ✓
- Is Available: ✓
```

### Part 4: Generate First Timetable

#### Via Django Admin:

1. Go to **Timetable Templates**
2. Click **Add Timetable Template**
3. Fill in:
   - Name: "Sem 1 - 2024"
   - Semester: [Select created semester]
   - Program: [Select FYUP]
   - Start Time: 09:00:00
   - End Time: 17:00:00
   - Slot Duration: 60
   - Break Duration: 15
   - Lunch Break Start: 13:00:00
   - Lunch Break Duration: 60
   - Max Lectures Per Day: 6
   - Prefer Morning Sessions: ✓
   - Avoid Back-to-Back Practicals: ✓
4. Save

#### Via API:

```bash
# Get authentication token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your_password"}'

# Use token to create timetable
curl -X POST http://localhost:8000/api/timetable/templates/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Semester 1 - 2024",
    "semester": 1,
    "program": 1,
    "start_time": "09:00:00",
    "end_time": "17:00:00",
    "slot_duration": 60
  }'

# Trigger generation
curl -X POST http://localhost:8000/api/timetable/templates/1/generate/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Via Frontend:

1. Open http://localhost:5173
2. Navigate to **Timetables**
3. Click **Create New Timetable**
4. Fill in the form
5. Click **Generate**
6. Wait for optimization to complete
7. View generated timetable

### Part 5: Verify Installation

#### Check Backend:
- Django admin accessible: http://localhost:8000/admin ✓
- API docs accessible: http://localhost:8000/api/docs/ ✓
- Database connected: Check admin pages load ✓
- Redis working: Celery tasks execute ✓

#### Check Frontend:
- Frontend loads: http://localhost:5173 ✓
- API connection: Dashboard shows data ✓
- Navigation works: All pages accessible ✓

## Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: could not connect to server
```
**Solution:**
- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Check credentials in `.env`
- Verify database exists: `psql -l`

#### 2. Redis Connection Error
```
Error: Connection refused (redis)
```
**Solution:**
- Start Redis: `redis-server`
- Check Redis is running: `redis-cli ping` (should return PONG)

#### 3. Module Import Errors
```
ModuleNotFoundError: No module named 'xyz'
```
**Solution:**
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

#### 4. Frontend Not Loading
```
Failed to fetch
```
**Solution:**
- Ensure backend is running on port 8000
- Check CORS settings in backend/settings.py
- Verify proxy configuration in vite.config.ts

#### 5. Celery Not Processing Tasks
```
Task stuck in 'PENDING' state
```
**Solution:**
- Ensure Celery worker is running
- Check Redis connection
- View Celery logs for errors

## Next Steps

1. **Customize Settings**: Adjust timetable parameters in admin
2. **Add Your Data**: Import your institution's data
3. **Test Generation**: Generate test timetables
4. **Configure Constraints**: Add custom constraints
5. **Train Staff**: Provide access to relevant users
6. **Production Deployment**: Follow deployment guide

## Getting Help

- Check documentation: [README.md](README.md)
- Report issues: GitHub Issues
- Email support: support@example.com

---

**Congratulations! Your timetable scheduler is ready to use.**