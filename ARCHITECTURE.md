# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         NEP 2020 Timetable Scheduler             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   React Frontend │◄────────┤   REST API       │
│   (Port 5173)    │  HTTPS  │   (Port 8000)    │
└──────────────────┘         └──────────────────┘
         │                            │
         │                            ▼
         │                   ┌─────────────────┐
         │                   │  Django Backend  │
         │                   │                  │
         │                   │  - Core App      │
         │                   │  - Timetable App │
         │                   │  - Optimization  │
         │                   └─────────────────┘
         │                            │
         │                   ┌────────┴────────┐
         │                   │                 │
         │                   ▼                 ▼
         │          ┌────────────────┐  ┌────────────┐
         │          │   PostgreSQL   │  │   Redis    │
         │          │   Database     │  │   Cache    │
         │          └────────────────┘  └────────────┘
         │                                      │
         │                                      ▼
         │                             ┌────────────────┐
         └─────────────────────────────┤ Celery Workers │
                                       │  (Async Tasks)  │
                                       └────────────────┘
```

## Component Architecture

### Frontend Layer

```
┌─────────────────────────────────────────────────────┐
│               React Application                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐│
│  │   Layout     │  │   Pages      │  │ Components││
│  │              │  │              │  │           ││
│  │ - Sidebar    │  │ - Dashboard  │  │ - Forms   ││
│  │ - Header     │  │ - Timetables │  │ - Tables  ││
│  │ - Navigation │  │ - Courses    │  │ - Modals  ││
│  └──────────────┘  └──────────────┘  └───────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │          API Client (Axios)                   │  │
│  │  - Authentication                             │  │
│  │  - Data Fetching (React Query)               │  │
│  │  - Error Handling                             │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │          State Management                     │  │
│  │  - React Query (Server State)                │  │
│  │  - Zustand (Client State - Optional)         │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Backend Layer

```
┌─────────────────────────────────────────────────────┐
│              Django Application                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │           API Layer (DRF)                     │  │
│  │  - ViewSets                                   │  │
│  │  - Serializers                                │  │
│  │  - Authentication (JWT)                       │  │
│  │  - Permissions                                │  │
│  │  - API Documentation (drf-spectacular)       │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │          Business Logic Layer                 │  │
│  │                                                │  │
│  │  ┌─────────┐  ┌──────────┐  ┌────────────┐  │  │
│  │  │  Core   │  │Timetable │  │Optimization│  │  │
│  │  │  App    │  │   App    │  │    App     │  │  │
│  │  │         │  │          │  │            │  │  │
│  │  │-Academic│  │-Template │  │-OR-Tools   │  │  │
│  │  │-Courses │  │-Schedule │  │-Genetic    │  │  │
│  │  │-Faculty │  │-Conflicts│  │ Algorithm  │  │  │
│  │  │-Rooms   │  │-Tasks    │  │-Services   │  │  │
│  │  └─────────┘  └──────────┘  └────────────┘  │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │          Data Access Layer                    │  │
│  │  - Django ORM                                 │  │
│  │  - Models                                     │  │
│  │  - Database Migrations                        │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Optimization Engine Architecture

```
┌─────────────────────────────────────────────────────┐
│           Optimization Engine                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │      TimetableGeneratorService               │  │
│  │  (Orchestration Layer)                       │  │
│  │                                                │  │
│  │  1. Prepare configuration                     │  │
│  │  2. Select optimization engine                │  │
│  │  3. Run optimization                          │  │
│  │  4. Save results                              │  │
│  └──────────────────────────────────────────────┘  │
│                  │                                   │
│       ┌──────────┴──────────┐                      │
│       ▼                      ▼                       │
│  ┌─────────────┐      ┌─────────────┐              │
│  │  OR-Tools   │      │  Genetic    │              │
│  │  CP-SAT     │      │  Algorithm  │              │
│  │  Solver     │      │  (DEAP)     │              │
│  │             │      │             │              │
│  │ -Variables  │      │ -Population │              │
│  │ -Constraints│      │ -Fitness    │              │
│  │ -Objective  │      │ -Evolution  │              │
│  │ -Solver     │      │ -Selection  │              │
│  └─────────────┘      └─────────────┘              │
│       │                      │                       │
│       └──────────┬──────────┘                       │
│                  ▼                                   │
│  ┌──────────────────────────────────────────────┐  │
│  │      Constraint Evaluation                    │  │
│  │                                                │  │
│  │  Hard Constraints:                            │  │
│  │  - No double booking                          │  │
│  │  - Faculty qualification                      │  │
│  │  - Room capacity                              │  │
│  │  - Lab requirements                           │  │
│  │  - Workload limits                            │  │
│  │                                                │  │
│  │  Soft Constraints:                            │  │
│  │  - Time preferences                           │  │
│  │  - Faculty preferences                        │  │
│  │  - Distribution balance                       │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Data Flow

### Timetable Generation Flow

```
1. User Input
   │
   ├─► Create Timetable Template
   │   - Select semester
   │   - Select program
   │   - Set parameters
   │
   ▼
2. API Request
   │
   ├─► POST /api/timetable/templates/{id}/generate/
   │   - Validates input
   │   - Creates Celery task
   │
   ▼
3. Async Processing
   │
   ├─► Celery Worker
   │   │
   │   ├─► Load Configuration
   │   │   - Fetch courses
   │   │   - Fetch faculty
   │   │   - Fetch rooms
   │   │   - Generate time slots
   │   │
   │   ├─► Run Optimization
   │   │   - Create variables
   │   │   - Add constraints
   │   │   - Solve
   │   │
   │   └─► Save Results
   │       - Create time slots
   │       - Create scheduled classes
   │       - Log conflicts
   │
   ▼
4. Result
   │
   └─► Timetable Generated
       - Status: GENERATED
       - Schedule created
       - Conflicts logged
       - Ready for review
```

### Authentication Flow

```
1. User Login
   │
   ├─► POST /api/token/
   │   {username, password}
   │
   ▼
2. Server Validates
   │
   ├─► Check credentials
   │   └─► Generate JWT tokens
   │       - Access token (1 hour)
   │       - Refresh token (7 days)
   │
   ▼
3. Client Stores
   │
   ├─► Save tokens
   │   └─► Use in requests
   │       Authorization: Bearer <token>
   │
   ▼
4. Protected Requests
   │
   ├─► API validates token
   │   └─► Return data or 401
   │
   ▼
5. Token Refresh (when expired)
   │
   └─► POST /api/token/refresh/
       {refresh_token}
```

## Database Schema

### Core Models Relationships

```
┌──────────────┐
│ AcademicYear │
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────┐
│  Semester    │
└──────┬───────┘
       │
       │ N:1        ┌──────────┐
       └───────────►│ Program  │
                    └────┬─────┘
                         │ 1:N
                         ▼
                    ┌──────────┐     ┌─────────────┐
                    │  Course  │────►│ Department  │
                    └────┬─────┘     └─────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │ Faculty │    │  Room   │    │ Student │
    └─────────┘    └─────────┘    └─────────┘
          │              │              │
          └──────────────┼──────────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ScheduledClass   │
                └─────────────────┘
```

## Technology Stack Details

### Backend Stack

```
Python 3.11+
├── Django 5.0           (Web Framework)
├── DRF 3.14            (REST API)
│   ├── drf-spectacular (API Docs)
│   └── JWT Auth        (Security)
├── PostgreSQL          (Database)
├── OR-Tools 9.8        (Optimization)
├── DEAP 1.4            (Genetic Algorithm)
├── Celery 5.3          (Task Queue)
└── Redis 7.0           (Message Broker)
```

### Frontend Stack

```
Node.js 18+
├── React 18            (UI Framework)
├── TypeScript          (Type Safety)
├── Vite 5              (Build Tool)
├── TailwindCSS 3       (Styling)
├── React Router 6      (Navigation)
├── React Query         (Data Fetching)
├── Axios               (HTTP Client)
└── FullCalendar        (Calendar View)
```

## Deployment Architecture

### Production Setup

```
┌─────────────────────────────────────────┐
│              Internet                    │
└────────────────┬────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │  Nginx        │ (Port 80/443)
         │  Reverse Proxy│
         └───────┬───────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│   Frontend   │  │   Backend    │
│   (Static)   │  │  (Gunicorn)  │
└──────────────┘  └───────┬──────┘
                          │
                 ┌────────┴────────┐
                 │                 │
                 ▼                 ▼
         ┌──────────────┐  ┌──────────────┐
         │  PostgreSQL  │  │    Redis     │
         └──────────────┘  └───────┬──────┘
                                   │
                                   ▼
                           ┌──────────────┐
                           │Celery Workers│
                           └──────────────┘
```

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────┐
│       Security Layers                │
├─────────────────────────────────────┤
│                                      │
│  1. HTTPS/TLS                       │
│     └─► SSL Certificates            │
│                                      │
│  2. JWT Authentication              │
│     ├─► Access Token (1 hour)       │
│     └─► Refresh Token (7 days)      │
│                                      │
│  3. CORS Protection                 │
│     └─► Allowed Origins             │
│                                      │
│  4. CSRF Protection                 │
│     └─► Django CSRF Middleware      │
│                                      │
│  5. Rate Limiting                   │
│     └─► API Throttling              │
│                                      │
│  6. Input Validation                │
│     └─► DRF Serializers             │
│                                      │
│  7. SQL Injection Prevention        │
│     └─► Django ORM                  │
└─────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling

```
Load Balancer
      │
      ├─► Django Instance 1
      ├─► Django Instance 2
      ├─► Django Instance 3
      │
      ├─► Celery Worker 1
      ├─► Celery Worker 2
      └─► Celery Worker 3
```

### Performance Optimization

- **Database**: Connection pooling, query optimization, indexes
- **Caching**: Redis for frequently accessed data
- **API**: Pagination, selective field loading
- **Frontend**: Code splitting, lazy loading, CDN
- **Async**: Celery for long-running tasks

## Monitoring & Logging

```
┌─────────────────────────────────────┐
│     Monitoring Stack (Future)        │
├─────────────────────────────────────┤
│  - Application Logs (Django)        │
│  - Celery Task Logs                 │
│  - Database Query Logs              │
│  - API Request Logs                 │
│  - Error Tracking (Sentry)          │
│  - Performance Monitoring (APM)     │
└─────────────────────────────────────┘
```

---

This architecture supports:
- ✅ NEP 2020 compliance
- ✅ Scalability for large institutions
- ✅ High performance optimization
- ✅ Secure authentication
- ✅ Async task processing
- ✅ Easy maintenance and updates
