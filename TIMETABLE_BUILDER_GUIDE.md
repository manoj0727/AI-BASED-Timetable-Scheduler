# 📅 Visual Timetable Builder Guide

Complete guide to using the interactive visual timetable builder with AI optimization and conflict detection.

---

## 🎯 Features

### ✨ Visual Interface
- **Interactive Calendar Grid**: Week-view layout showing Monday-Friday, 8 AM - 6 PM
- **Click-to-Schedule**: Click any time slot to add a class
- **Color-Coded Classes**: Blue for theory classes, Green for lab classes
- **Real-Time Updates**: Calendar refreshes instantly when classes are added

### 🤖 AI-Powered Generation
- **Hybrid Optimization Algorithm**: Combines Simulated Annealing, Tabu Search, Hill Climbing, and Genetic Algorithms
- **Smart Scheduling**: Automatically handles 10 constraints (6 hard, 4 soft)
- **One-Click Generation**: Generate complete timetable in seconds

### ⚠️ Conflict Detection
- **Real-Time Validation**: Checks conflicts before saving
- **Hard Conflicts**: Faculty double-booking, Room double-booking (blocks save)
- **Soft Conflicts**: Morning preference violations, back-to-back labs (shows warning)
- **Visual Alerts**: Conflict panel with severity badges

### 📊 Statistics Dashboard
- **Total Classes**: Count of all scheduled classes
- **Theory vs Lab**: Breakdown of class types
- **Live Updates**: Stats update as you add/remove classes

---

## 🚀 How to Use

### Step 1: Create New Timetable

1. Navigate to **Timetables** → **Create New Timetable**
2. Fill in the required details:
   - **Timetable Name**: e.g., "Fall 2024 - Computer Science"
   - **Academic Year**: Select from dropdown (e.g., "2024-2025")
   - **Semester**: Select semester (e.g., "Fall 2024")
   - **Program**: Select program (e.g., "B.Tech Computer Science")
3. Click **Create Timetable**

### Step 2: Add Classes (Two Methods)

#### Method A: AI Generation (Recommended)

1. Click **Generate with AI** button
2. Wait for AI optimization (typically 5-30 seconds)
3. Review the generated timetable
4. Make manual adjustments if needed

**How AI Generation Works:**
- Fetches all courses for the selected program
- Assigns faculty based on expertise
- Allocates rooms based on capacity and lab requirements
- Optimizes for constraints:
  - No faculty/room double-booking
  - Respects faculty availability
  - Balances workload across days
  - Prefers morning slots for theory
  - Avoids consecutive lab sessions

#### Method B: Manual Scheduling

1. Click **Add Class Manually** button
   - OR click directly on any time slot in the calendar
2. Fill in the class details:
   - **Course**: Select from dropdown
   - **Faculty**: Select instructor
   - **Room**: Select classroom/lab
3. Click **Add Class**

**Conflict Checking:**
- System automatically checks for conflicts
- If **hard conflict** detected: Save is blocked, error shown
- If **soft conflict** detected: Warning shown, you can choose to proceed
- Conflict details displayed in alert panel

### Step 3: Review and Adjust

**View Class Details:**
- Click on any class block in calendar
- Popup shows: Course name, Faculty, Room

**Monitor Statistics:**
- Check total classes scheduled
- Review theory vs lab distribution
- Ensure balanced workload

**Handle Conflicts:**
- If conflicts appear, review the conflict panel
- Red badge = Hard conflict (must fix)
- Yellow badge = Soft conflict (optional fix)
- Adjust schedule by removing/rescheduling conflicting classes

### Step 4: Publish Timetable

1. Review the complete timetable
2. Ensure no hard conflicts remain
3. Click **Publish Timetable** button
4. Timetable becomes visible to students and faculty

---

## 🎨 Visual Guide

### Calendar Color Coding

| Color | Meaning |
|-------|---------|
| 🔵 Blue | Theory Class |
| 🟢 Green | Lab Class |

### Conflict Severity

| Badge | Severity | Action Required |
|-------|----------|----------------|
| 🔴 Red | Hard | Must resolve before publishing |
| 🟡 Yellow | Soft | Optional, can proceed with warning |

### Calendar Controls

- **Today**: Jump to current week
- **Prev/Next**: Navigate weeks
- **Time Slots**: 1-hour intervals (customizable)
- **Selectable**: Click and drag to select time range

---

## ⚙️ Technical Details

### API Endpoints Used

```
POST /api/v1/timetables
- Creates new timetable template

POST /api/v1/timetables/{id}/generate
- AI-generates complete timetable

POST /api/v1/timetables/check-conflicts
- Validates scheduling conflicts

POST /api/v1/timetables/{id}/classes
- Adds individual class to timetable

POST /api/v1/timetables/{id}/publish
- Publishes timetable
```

### Constraints Handled

**Hard Constraints (Must Satisfy):**
1. Faculty cannot teach two classes simultaneously
2. Room cannot host two classes simultaneously
3. Faculty workload limits (max hours per week)
4. Room capacity must accommodate students
5. Lab courses must be in lab rooms
6. Faculty must be available at scheduled time

**Soft Constraints (Optimize):**
1. Morning preference for theory classes (9 AM - 12 PM)
2. Faculty course preferences
3. Avoid back-to-back lab sessions
4. Balanced distribution across weekdays

### Optimization Algorithm

The system uses a **Hybrid Approach**:

1. **Greedy Construction** (Initial Solution)
   - Fast heuristic to create valid starting point
   - Assigns courses to first available slot

2. **Simulated Annealing** (Global Search)
   - Escapes local optima
   - Temperature-based acceptance of worse solutions

3. **Tabu Search** (Memory-Based)
   - Maintains tabu list of recent moves
   - Prevents cycling back to previous states

4. **Hill Climbing** (Local Refinement)
   - Fine-tunes solution
   - Only accepts improvements

5. **Genetic Algorithm** (Population-Based)
   - Maintains population of solutions
   - Crossover and mutation operators

**Performance:**
- Generates timetable for 20-30 courses in 5-15 seconds
- Handles programs with 50+ courses in under 60 seconds
- Configurable timeout (default: 5 minutes)

---

## 💡 Best Practices

### For Manual Scheduling

1. **Start with Lab Sessions**
   - Labs are harder to schedule (room constraints)
   - Schedule 2-3 hour blocks for labs

2. **Group by Program/Semester**
   - Keep same-semester courses together
   - Avoid conflicts within program

3. **Balance Across Days**
   - Don't overload Monday or Friday
   - Aim for even distribution

4. **Use Morning for Core Courses**
   - Students more alert in morning
   - Reserve afternoon for labs/electives

### For AI Generation

1. **Prepare Master Data First**
   - Add all courses before generating
   - Set faculty availability accurately
   - Configure room features correctly

2. **Review AI Results**
   - Always review generated timetable
   - Check for any suboptimal placements
   - Manually adjust if needed

3. **Iterate if Needed**
   - If unsatisfied, click "Generate with AI" again
   - Each run produces different solution
   - Pick the best among multiple runs

---

## 🐛 Troubleshooting

### Issue: "Failed to add class: Hard conflicts detected"

**Cause:** Faculty or room already booked at that time

**Solution:**
1. Check conflict panel for details
2. Either:
   - Choose different faculty
   - Choose different room
   - Select different time slot

### Issue: "Failed to generate timetable"

**Possible Causes:**
- Not enough rooms available
- Faculty availability too restricted
- Over-constrained (impossible to satisfy all constraints)

**Solutions:**
1. Add more rooms to database
2. Expand faculty availability windows
3. Reduce required courses
4. Check room capacities match course enrollment

### Issue: Calendar shows no events after adding classes

**Cause:** Frontend not fetching scheduled classes

**Solution:**
1. Check browser console for errors
2. Verify backend is running (http://localhost:8000)
3. Check network tab for API response
4. Refresh the page

### Issue: "Soft conflicts detected" warning

**This is normal!** Soft constraints are optimization goals, not requirements.

**What to do:**
- Review the warning message
- Decide if you can tolerate the suboptimal placement
- Click "Proceed" if acceptable
- Click "Cancel" and reschedule if not

---

## 📈 Performance Tips

### Speed Up AI Generation

1. **Reduce Timeout** (for quick results):
   ```
   Default: 300 seconds (5 minutes)
   Quick: 60 seconds (1 minute)
   ```

2. **Increase Workers** (for faster processing):
   ```
   Default: 8 workers
   Recommended: Match CPU cores (check with: nproc or sysctl -n hw.ncpu)
   ```

3. **Use Simpler Algorithm**:
   ```
   Hybrid: Best quality, slower
   Simulated Annealing: Good quality, faster
   Greedy: Fast, lower quality
   ```

### Handle Large Programs (100+ courses)

1. **Split by Semester**
   - Generate separate timetables per semester
   - Reduces search space

2. **Pre-assign Core Courses**
   - Manually schedule critical courses first
   - Let AI fill in electives

3. **Increase Timeout**
   - Allow more time for complex schedules
   - Set timeout to 10-15 minutes for large programs

---

## 🔐 Permissions and Publishing

### Draft Mode (Default)
- Timetable not visible to students
- Can be edited freely
- Used for planning and iteration

### Published Mode
- Visible to all users
- Students can view their schedules
- Faculty can see their assignments
- Should be final version

**To Publish:**
1. Ensure no hard conflicts
2. Review all classes
3. Click "Publish Timetable"
4. Confirm action

**After Publishing:**
- Editing may require unpublishing first
- Changes affect users immediately
- Consider notifying users of changes

---

## 🎓 Example Workflow

### Scenario: Creating Fall 2024 CS Timetable

1. **Prepare Data** (One-time setup)
   - Add Academic Year: "2024-2025"
   - Add Semester: "Fall 2024" (Aug 1 - Dec 31)
   - Add Department: "Computer Science"
   - Add Program: "B.Tech CS"
   - Add 8 courses (4 theory, 4 labs)
   - Add 10 faculty members with availability
   - Add 15 rooms (10 classrooms, 5 labs)

2. **Create Timetable**
   - Name: "Fall 2024 - B.Tech CS - Semester 3"
   - Academic Year: "2024-2025"
   - Semester: "Fall 2024"
   - Program: "B.Tech CS"

3. **Generate with AI**
   - Click "Generate with AI"
   - Wait 10 seconds
   - System schedules all 8 courses

4. **Review Results**
   - Check for conflicts (none!)
   - Notice labs scheduled in afternoon
   - Theory classes in morning slots
   - Even distribution across days

5. **Manual Adjustment**
   - Faculty requests Wednesday off
   - Move Data Structures from Wed 10 AM to Thu 10 AM
   - No conflicts detected
   - Save changes

6. **Publish**
   - Final review
   - Click "Publish Timetable"
   - Students and faculty notified

---

## 📱 Browser Compatibility

✅ **Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

⚠️ **Not Supported:**
- Internet Explorer (any version)
- Chrome < 90
- Firefox < 88

**Recommended:** Latest Chrome or Firefox for best performance

---

## 🔗 Related Documentation

- [Setup Guide](LOCAL_SETUP_GUIDE.md) - Setting up the project
- [README](README.md) - Project overview
- [API Documentation](go-backend/internal/handlers/routes.go) - Available endpoints

---

## 🆘 Need Help?

**Visual Builder Issues:**
- Check browser console for JavaScript errors
- Ensure FullCalendar loaded (check Network tab)
- Verify API endpoints responding (check Network tab)

**Scheduling Issues:**
- Review constraint violations in conflict panel
- Check master data (courses, faculty, rooms)
- Try AI generation with different settings

**Performance Issues:**
- Reduce number of courses
- Increase optimization timeout
- Use faster algorithm (Greedy or SA only)

---

**Happy Scheduling! 🎉**

The visual timetable builder makes course scheduling easy, intelligent, and conflict-free!
