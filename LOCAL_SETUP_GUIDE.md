# 🚀 Local Setup Guide

Complete guide to run the AI-Based Timetable Scheduler on your local machine with PostgreSQL.

---

## 📋 Prerequisites

- **Go** 1.22 or higher ([Download](https://go.dev/dl/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Node.js** 18+ (for frontend - optional)
- **Git**

---

## ⚡ Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/AI-BASED-Timetable-Scheduler.git
cd AI-BASED-Timetable-Scheduler
```

### 2. Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### 3. Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE timetable_db;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE timetable_db TO postgres;

# Exit
\q
```

### 4. Run Migrations

```bash
# Run database migrations
psql -U postgres -d timetable_db -f database/migrations/001_initial_schema.sql
psql -U postgres -d timetable_db -f database/migrations/002_seed_data.sql
```

### 5. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Generate JWT secret
openssl rand -base64 32

# Edit .env and paste the JWT secret
nano .env  # or use your favorite editor
```

**Minimal `.env` configuration:**
```env
# Application
APP_ENV=development
APP_PORT=8000
JWT_SECRET=<paste-your-generated-secret-here>

# Database (default values work with step 3)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=timetable_db
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/timetable_db?sslmode=disable

# Storage
STORAGE_PATH=./storage/uploads
```

### 6. Install Go Dependencies

```bash
cd go-backend
go mod download
```

### 7. Run the Application

```bash
# From go-backend directory
go run cmd/server/main.go
```

You should see:
```
🚀 Starting AI Timetable Scheduler in development mode
✅ Database connected successfully
✅ Server running on http://localhost:8000
```

### 8. Test the API

```bash
# Health check
curl http://localhost:8000/health

# Get academic years
curl http://localhost:8000/api/v1/academic/years
```

---

## 🐳 Docker Setup (Alternative)

If you prefer Docker, everything is configured for you:

### 1. Configure Environment

```bash
cp .env.example .env
# Edit .env with JWT secret (generate with: openssl rand -base64 32)
```

### 2. Start with Docker Compose

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Go Backend** on port 8000

### 3. Run Migrations

```bash
# Migrations run automatically on first start via docker-entrypoint-initdb.d
# If needed, you can run manually:
docker exec -it timetable-db psql -U postgres -d timetable_db -f /docker-entrypoint-initdb.d/001_initial_schema.sql
```

### 4. Check Status

```bash
docker-compose ps
docker-compose logs go-backend
```

### 5. Stop Services

```bash
docker-compose down
# To remove volumes (database data):
docker-compose down -v
```

---

## 📁 Project Structure

```
AI-BASED-Timetable-Scheduler/
├── go-backend/               # Go application
│   ├── cmd/server/main.go   # Entry point
│   ├── internal/
│   │   ├── config/          # Configuration (updated for local DB)
│   │   ├── database/        # Database connection
│   │   ├── models/          # 19 database models
│   │   ├── handlers/        # API endpoints
│   │   └── optimization/    # AI algorithms
│   ├── Dockerfile
│   └── go.mod
│
├── database/migrations/      # SQL migrations
│   ├── 001_initial_schema.sql  # 19 tables
│   └── 002_seed_data.sql       # Sample data
│
├── .env.example              # Environment template
├── docker-compose.yml        # Docker orchestration
└── LOCAL_SETUP_GUIDE.md      # This file
```

---

## 🗄️ Database Details

### Connection Info
- **Host**: localhost
- **Port**: 5432
- **Database**: timetable_db
- **User**: postgres
- **Password**: postgres

### Tables Created (19)
**Core Academic (12):** academic_years, semesters, departments, programs, course_categories, courses, faculty, faculty_availability, faculty_course_expertise, rooms, students, student_enrollments

**Timetable (7):** timetable_templates, time_slots, scheduled_classes, timetable_constraints, conflict_logs

### Verify Database

```bash
# Connect to database
psql -U postgres -d timetable_db

# List tables
\dt

# Check table structure
\d academic_years

# Query data
SELECT * FROM course_categories;

# Exit
\q
```

---

## 🔧 Common Issues & Solutions

### Problem: "Database connection refused"
**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list                # macOS

# Start PostgreSQL
sudo systemctl start postgresql   # Linux
brew services start postgresql@15 # macOS
```

### Problem: "Database does not exist"
**Solution:**
```bash
# Create database
psql postgres
CREATE DATABASE timetable_db;
\q
```

### Problem: "Password authentication failed"
**Solution:**
```bash
# Reset password
psql postgres
ALTER USER postgres WITH PASSWORD 'postgres';
\q

# Update .env with correct password
```

### Problem: "Port 8000 already in use"
**Solution:**
```bash
# Change port in .env
APP_PORT=8001

# Or kill process using port 8000
lsof -ti:8000 | xargs kill
```

### Problem: "go: module not found"
**Solution:**
```bash
cd go-backend
go mod tidy
go mod download
```

---

## 📡 API Testing

### Using cURL

```bash
# Health check
curl http://localhost:8000/health

# List academic years
curl http://localhost:8000/api/v1/academic/years

# Create academic year
curl -X POST http://localhost:8000/api/v1/academic/years \
  -H "Content-Type: application/json" \
  -d '{
    "year": "2024-2025",
    "start_date": "2024-07-01T00:00:00Z",
    "end_date": "2025-06-30T00:00:00Z",
    "is_active": true
  }'
```

### Using Postman

1. Import collection from `/docs/postman_collection.json` (if available)
2. Set base URL: `http://localhost:8000/api/v1`
3. Test endpoints

---

## 🎯 Next Steps

Once the application is running:

1. **Set Up Basic Data**
   - Create Academic Year
   - Create Semesters
   - Add Departments
   - Add Programs

2. **Add Courses**
   - Use course categories from seed data
   - Add theory and lab courses
   - Set credits and hours

3. **Add Faculty**
   - Set availability (days/times)
   - Map course expertise
   - Set preferences

4. **Add Rooms**
   - Classrooms, labs, halls
   - Set capacity and features

5. **Generate Timetable**
   - Create timetable template
   - Run optimization algorithm
   - Review and publish

---

## 📊 Performance Tips

### Development
- Use `APP_ENV=development` for detailed logs
- Set `LOG_LEVEL=debug` for troubleshooting

### Production
- Use `APP_ENV=production`
- Set `LOG_LEVEL=info` or `warn`
- Increase `OPTIMIZATION_WORKERS` based on CPU cores

### Database
```sql
-- Add indexes for better performance (already in schema)
-- Vacuum database regularly
VACUUM ANALYZE;

-- Check database size
SELECT pg_size_pretty(pg_database_size('timetable_db'));
```

---

## 🔐 Security

### For Production:

1. **Change Default Credentials**
   ```env
   DB_PASSWORD=<strong-password-here>
   JWT_SECRET=<strong-secret-here>
   ```

2. **Enable SSL**
   ```env
   DB_SSLMODE=require
   ```

3. **Restrict CORS**
   ```env
   CORS_ORIGINS=https://yourdomain.com
   ```

4. **Use Environment Variables**
   - Don't commit `.env` to Git
   - Use secrets management in production

---

## 📖 Additional Resources

- [README.md](README.md) - Project overview
- [Go Backend Code](go-backend/) - API implementation
- [Database Migrations](database/migrations/) - SQL schema
- [Docker Compose](docker-compose.yml) - Container setup

---

## 🆘 Need Help?

1. Check logs:
   ```bash
   # Application logs
   go run cmd/server/main.go

   # Database logs (Linux)
   sudo tail -f /var/log/postgresql/postgresql-15-main.log
   ```

2. Verify configuration:
   ```bash
   cat .env
   ```

3. Test database connection:
   ```bash
   psql -U postgres -d timetable_db -c "SELECT version();"
   ```

---

**Happy Coding! 🎉**

All functionality remains the same - just using local PostgreSQL instead of Supabase!
